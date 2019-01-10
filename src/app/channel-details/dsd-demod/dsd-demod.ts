export interface DSDDemodSettings {
    audioDeviceName: string;
    audioMute: number;
    baudRate: number;
    demodGain: number;
    enableCosineFiltering: number;
    fmDeviation: number;
    highPassFilter: number;
    inputFrequencyOffset: number;
    pllLock: number;
    rfBandwidth: number;
    rgbColor: number;
    slot1On: number;
    slot2On: number;
    squelch: number;
    squelchGate: number;
    syncOrConstellation: number;
    tdmaStereo: number;
    title: string;
    traceDecay: number;
    traceLengthMutliplier: number;
    traceStroke: number;
    volume: number;
}

export const DSDDEMOD_SETTINGS_DEFAULT = {
    audioDeviceName: 'System default device',
    audioMute: 0,
    baudRate: 2400,
    demodGain: 1,
    enableCosineFiltering: 1,
    fmDeviation: 2600,
    highPassFilter: 1,
    inputFrequencyOffset: 4250,
    pllLock: 1,
    rfBandwidth: 6100,
    rgbColor: -16711681,
    slot1On: 1,
    slot2On: 0,
    squelch: -50,
    squelchGate: 1,
    syncOrConstellation: 0,
    tdmaStereo: 0,
    title: 'DSD Demodulator',
    traceDecay: 200,
    traceLengthMutliplier: 6,
    traceStroke: 100,
    volume: 3.2
};

export interface DSDDemodReport {
    audioSampleRate: number;
    carierPosition: number;
    channelPowerDB: number;
    channelSampleRate: number;
    inLevel: number;
    pllLocked: number;
    slot1On: number;
    slot2On: number;
    squelch: number;
    statusText: string;
    syncRate: number;
    syncType: string;
    zeroCrossingPosition: number;
}

export const DSDDEMOD_REPORT_DEFAULT = {
    audioSampleRate: 48000,
    carierPosition: 4,
    channelPowerDB: -29.7553653717041,
    channelSampleRate: 48000,
    inLevel: 85,
    pllLocked: 1,
    slot1On: 0,
    slot2On: 0,
    squelch: 1,
    statusText: 'RT H 01 08 01311>G00003',
    syncRate: 100,
    syncType: '+NXDN48      ',
    zeroCrossingPosition: 0
};
