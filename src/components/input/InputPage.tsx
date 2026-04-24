import React, { useState, useCallback } from 'react';
import { Container, Grid, Paper, Typography, TextField, Slider, Button, Box, Stack, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Upload, FileUp, CheckCircle2, FileText, Camera, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { useEnergy } from '../../context/EnergyContext';
import { useDropzone } from 'react-dropzone';
import ExcelJS from 'exceljs';
import { pb } from '../../lib/pocketbase';
import { avgUsageData } from '../../lib/dataset';

export const InputPage = () => {
  const navigate = useNavigate();
  const { setEnergyData, setIsInitial } = useEnergy();
  
  const [formData, setFormData] = useState({
    usage: '',
    bill: '',
    pincode: '',
    acHours: 6,
    applianceLevel: 2,
  });

  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const startAnalysis = (data: any) => {
    setIsAnalysing(true);
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setAnalysisProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setEnergyData(data);
        setIsInitial(false);
        localStorage.setItem(`hasData_${pb.authStore.model?.id}`, 'true');
        navigate('/dashboard');
      }
    }, 200);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const usageNum = Number(formData.usage);
    const billNum = formData.bill ? Number(formData.bill) : 0;

    if (usageNum < 0 || usageNum > 1000) {
      newErrors.usage = 'Usage must be between 0 and 1000 kWh';
    }
    if (formData.bill && (billNum < 0 || billNum > 10000)) {
      newErrors.bill = 'Bill must be between ₹0 and ₹10000';
    }
    if (formData.acHours < 0 || formData.acHours > 12) {
      newErrors.acHours = 'AC hours must be between 0 and 12';
    }
    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    startAnalysis({
      usage: Number(formData.usage),
      bill: formData.bill ? Number(formData.bill) : undefined,
      pincode: formData.pincode,
      acHours: formData.acHours,
      applianceLevel: formData.applianceLevel,
      avgUsage: avgUsageData[formData.pincode] || avgUsageData.default,
    });
  };

  // ── ExcelJS replacement for xlsx ──────────────────────────────────────────
  const onDropExcel = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadStatus('idle');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];
        if (!worksheet || worksheet.rowCount < 2) {
          setUploadStatus('error');
          setUploadError('Spreadsheet is empty.');
          return;
        }

        // Read header row (row 1) to build a key→colNumber map
        const headerRow = worksheet.getRow(1);
        const headers: Record<string, number> = {};
        headerRow.eachCell((cell, colNumber) => {
          const key = String(cell.value ?? '').trim().toLowerCase();
          if (key) headers[key] = colNumber;
        });

        // Read first data row (row 2)
        const dataRow = worksheet.getRow(2);
        const getValue = (key: string) => {
          const col = headers[key];
          return col ? dataRow.getCell(col).value : undefined;
        };

        setUploadStatus('success');
        startAnalysis({
          usage: getValue('usage') ?? Math.floor(Math.random() * 120) + 180,
          bill: getValue('bill') ?? undefined,
          pincode: String(getValue('pincode') ?? '600001'),
          acHours: 6,
          applianceLevel: 2,
          avgUsage: 200,
        });
      } catch (err) {
        setUploadStatus('error');
        setUploadError('Failed to parse Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);   // ExcelJS needs ArrayBuffer, not binary string
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const { getRootProps: getExcelProps, getInputProps: getExcelInput } = useDropzone({
    onDrop: onDropExcel,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'text/csv': ['.csv'] },
    multiple: false
  });

  const [isScanning, setIsScanning] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAiScan = async (file: File) => {
    setIsScanning(true);
    setIsAnalysing(true);
    setAnalysisProgress(10);
    setUploadStatus('idle');

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      setAnalysisProgress(30);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: file.type } },
            { text: "Analyze this electricity bill or an image of home appliances. If it's a bill, extract 'usage_kwh', 'bill_amount_in_rupees', and 'pincode'. If it's an appliance image, identify the appliances and estimate their total daily usage hours and efficiency (1 for Eco, 2 for Standard, 3 for Power Hungry). Return ONLY valid JSON with fields: usage, bill, pincode, ac_hours, appliance_level." }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      setAnalysisProgress(70);
      const result = JSON.parse(response.text || '{}');
      
      setFormData({
        usage: result.usage?.toString() || '240',
        bill: result.bill?.toString() || '2400',
        pincode: result.pincode?.toString() || '600001',
        acHours: result.ac_hours || 6,
        applianceLevel: result.appliance_level || 2,
      });

      setAnalysisProgress(100);
      setUploadStatus('success');
      setTimeout(() => {
        setIsAnalysing(false);
        setIsScanning(false);
      }, 500);

    } catch (error: any) {
      console.error("AI Scan failed:", error);
      setIsAnalysing(false);
      setIsScanning(false);
      setUploadStatus('error');
      setUploadError("AI analysis failed. Please try manual entry.");
    }
  };

  const onDropImage = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleAiScan(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps: getImageProps, getInputProps: getImageInput } = useDropzone({
    onDrop: onDropImage,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false
  });

  return (
    <Container maxWidth="lg" className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <Typography variant="h3" className="font-bold text-slate-900 mb-4">Analyze Your Usage</Typography>
        <Typography variant="h6" className="text-slate-500 font-normal">Choose your preferred method to start the analysis.</Typography>
      </motion.div>

      <AnimatePresence mode="wait">
        {isAnalysing ? (
          <motion.div
            key="analysing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm min-h-[400px]"
          >
            <Box className="relative mb-8">
              <CircularProgress 
                variant="determinate" 
                value={analysisProgress} 
                size={100} 
                thickness={4} 
                color={uploadStatus === 'error' ? 'error' : 'secondary'} 
              />
              <Box className="absolute inset-0 flex items-center justify-center">
                {uploadStatus === 'success' ? (
                  <CheckCircle2 size={40} className="text-emerald-500" />
                ) : (
                  <Typography variant="h6" className="font-bold">{analysisProgress}%</Typography>
                )}
              </Box>
            </Box>
            <Typography variant="h5" className="font-bold text-slate-800 mb-2">
              {uploadStatus === 'error' ? 'Analysis Failed' : 'Analyzing Data...'}
            </Typography>
            <Typography variant="body2" className={uploadStatus === 'error' ? 'text-red-500 font-medium' : 'text-slate-500'}>
              {uploadStatus === 'error' 
                ? uploadError || 'Please check your connection.'
                : 'Extracting insights and building your dashboard'}
            </Typography>
            {uploadStatus === 'error' && (
              <Button 
                variant="outlined" 
                color="primary" 
                className="mt-6 rounded-xl"
                onClick={() => {
                   setIsAnalysing(false);
                   setUploadStatus('idle');
                }}
              >
                Try Again
              </Button>
            )}
          </motion.div>
        ) : (
          <Grid container spacing={4}>
            {/* Manual Entry */}
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="h-full"
              >
                <Paper className="p-8 h-full rounded-3xl shadow-sm border border-slate-100">
                <Typography variant="h5" className="font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <Zap size={24} className="text-secondary" /> Manual Entry
                </Typography>
                <form onSubmit={handleManualSubmit}>
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Monthly Usage (kWh)"
                        required
                        type="number"
                        value={formData.usage}
                        error={!!errors.usage}
                        helperText={errors.usage || "Maximum 1000 kWh"}
                        onChange={(e) => setFormData({...formData, usage: e.target.value})}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Monthly Bill (₹)"
                        type="number"
                        value={formData.bill}
                        error={!!errors.bill}
                        helperText={errors.bill || "Up to ₹10000"}
                        onChange={(e) => setFormData({...formData, bill: e.target.value})}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Pincode"
                        required
                        value={formData.pincode}
                        error={!!errors.pincode}
                        helperText={errors.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" className="mb-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Daily AC Usage (Hours)</Typography>
                      <Slider
                        value={formData.acHours}
                        min={0}
                        max={12}
                        step={1}
                        onChange={(_, v) => setFormData({...formData, acHours: v as number})}
                        color="secondary"
                        valueLabelDisplay="auto"
                      />
                      {errors.acHours && <Typography variant="caption" color="error">{errors.acHours}</Typography>}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" className="mb-4 font-bold text-slate-600 uppercase tracking-wider text-xs">Appliance Efficiency</Typography>
                      <ToggleButtonGroup
                        value={formData.applianceLevel}
                        exclusive
                        onChange={(_, v) => v && setFormData({...formData, applianceLevel: v})}
                        fullWidth
                        color="secondary"
                        size="large"
                      >
                        <ToggleButton value={1} sx={{ borderRadius: '12px 0 0 12px' }}>Eco</ToggleButton>
                        <ToggleButton value={2}>Standard</ToggleButton>
                        <ToggleButton value={3} sx={{ borderRadius: '0 12px 12px 0' }}>High</ToggleButton>
                      </ToggleButtonGroup>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="large"
                        type="submit"
                        className="py-4 font-bold text-lg rounded-2xl shadow-lg"
                      >
                        Analyze My Usage
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </motion.div>
          </Grid>

            {/* Upload Section */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={4}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Paper className="p-8 rounded-3xl shadow-sm border border-slate-100 bg-slate-50/50">
                    <Typography variant="h6" className="font-bold mb-4 flex items-center gap-2 text-slate-800">
                      <Upload size={20} className="text-secondary" /> Excel Upload
                    </Typography>
                    <div 
                      {...getExcelProps()} 
                      className="cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-secondary transition-colors bg-white shadow-inner"
                    >
                      <input {...getExcelInput()} />
                      <FileUp size={40} className="mx-auto mb-4 text-slate-300" />
                      <Typography variant="body2" className="text-slate-600 font-medium">Drop .xlsx or .csv here</Typography>
                    </div>
                  </Paper>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Paper className="p-8 rounded-3xl shadow-sm border border-slate-100">
                    <Typography variant="h6" className="font-bold mb-4 flex items-center gap-2 text-slate-800">
                      <Sparkles size={20} className="text-secondary" /> AI Bill Scanner
                    </Typography>
                    <div 
                      {...getImageProps()}
                      className="cursor-pointer bg-gradient-to-br from-secondary/5 to-secondary/20 border-2 border-dashed border-secondary/30 rounded-2xl p-8 text-center hover:scale-105 transition-all"
                    >
                      <input {...getImageInput()} />
                      <Camera size={32} className="mx-auto mb-3 text-secondary" />
                      <Typography variant="subtitle1" className="font-bold text-secondary">Scan Bill or Appliance</Typography>
                      <Typography variant="caption" className="text-slate-500 block mt-1">Powered by gemini-3.1-pro-preview</Typography>
                    </div>
                  </Paper>
                </motion.div>
              </Stack>
            </Grid>
          </Grid>
        )}
      </AnimatePresence>
    </Container>
  );
};