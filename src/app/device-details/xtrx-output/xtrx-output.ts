export interface XTRXOutputSettings {
    centerFrequency?: number;
    devSampleRate?: number;
    log2HardInterp?: number;
    log2SoftInterp?: number;
    lpfBW?: number;
    gain?: number;
    ncoEnable?: number; // bool
    ncoFrequency?: number;
    antennaPath?: number; // xtrx_antenna_t
    extClock?: number; // bool
    extClockFreq?: number;
    pwrmode?: number;
    useReverseAPI?: number; // bool
    reverseAPIAddress?: string;
    reverseAPIPort?: number;
    reverseAPIDeviceIndex?: number;
}

export const XTRX_OUTPUT_SETTINGS_DEFAULT = {
    centerFrequency: 435000 * 1000,
    devSampleRate: 5000000,
    log2HardInterp: 2,
    log2SoftInterp: 4,
    lpfBW: 4500000,
    gain: 20,
    ncoEnable: 1,
    ncoFrequency: 500000,
    antennaPath: 4,
    extClock: 0,
    extClockFreq: 0,
    pwrmode: 1,
    fileRecordName: '',
    useReverseAPI: 0,
    reverseAPIAddress: '127.0.0.1',
    reverseAPIPort: 8888,
    reverseAPIDeviceIndex: 0
};

export interface XTRXOutputReport {
    success?: number; // bool
    fifoSize?: number;
    fifoFill?: number;
    temperature?: number;
    gpsLock?: number; // bool
}

export const XTRX_OUTPUT_REPORT_DEFAULT = {
    success: 0,
    fifoSize: 65536,
    fifoFill: 0,
    temperature: 0,
    gpsLock: 0
};
