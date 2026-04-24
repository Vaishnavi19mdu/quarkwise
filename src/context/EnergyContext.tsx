import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EnergyData {
  usage: number;
  bill?: number;
  pincode: string;
  acHours: number;
  applianceLevel: number;
  avgUsage: number;
  savingGoal: number;
  energyScore?: number;   // add this
  efficiency?: string;    // add this
  baseUsage?: number;     // add this
}

interface EnergyContextType {
  data: EnergyData;
  setEnergyData: (data: Partial<EnergyData>) => void;
  isInitial: boolean;
  setIsInitial: (val: boolean) => void;
}

const defaultData: EnergyData = {
  usage: 350,
  bill: 3500,
  pincode: '600001',
  acHours: 8,
  applianceLevel: 2,
  avgUsage: 200,
  savingGoal: 0,
};

const EnergyContext = createContext<EnergyContextType | undefined>(undefined);

export const EnergyProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<EnergyData>(defaultData);
  const [isInitial, setIsInitial] = useState(true);

  const setEnergyData = (newData: Partial<EnergyData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  return (
    <EnergyContext.Provider value={{ data, setEnergyData, isInitial, setIsInitial }}>
      {children}
    </EnergyContext.Provider>
  );
};

export const useEnergy = () => {
  const context = useContext(EnergyContext);
  if (!context) {
    throw new Error('useEnergy must be used within an EnergyProvider');
  }
  return context;
};
