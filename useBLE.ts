/* eslint-disable no-bitwise */
import { useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

import RNBluetoothClassic, { BluetoothDevice, BluetoothDeviceReadEvent } from "react-native-bluetooth-classic";

import base64 from "react-native-base64";

const HEART_RATE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  scanForPeripheralsClassic(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  connectToDeviceClassic: (deviceId: BluetoothDevice) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  connectedDeviceClassic: BluetoothDevice | null;
  allDevices: Device[];
  allDevicesClassic: BluetoothDevice[];
  heartRate: number;
  tags: string[];
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [allDevicesClassic, setAllDevicesClassic] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [connectedDeviceClassic, setConnectedDeviceClassic] = useState<BluetoothDevice | null>(null);
  const [heartRate, setHeartRate] = useState<number>(0);
  const [tags, setTags] = useState<string[]>([]);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const isDuplicteDeviceClassic = (devices: BluetoothDevice[], nextDevice: BluetoothDevice) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device) {
        setAllDevices((prevState: Device[]) => {
          // console.log(isDuplicteDevice(prevState, device));
          if (!isDuplicteDevice(prevState, device)) {
            // console.log('device id: ', device.id);
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const scanForPeripheralsClassic = async () => {
    console.log('scanning classic');
    // console.log('RNBluetoothClassic.startDiscovery(): ', RNBluetoothClassic.startDiscovery());
    // console.log('bleManager: ', bleManager);
    // let unpaired = await RNBluetoothClassic.startDiscovery();
    await RNBluetoothClassic.startDiscovery()
    .then((res) => {
      // console.log('res: ', res)
      // const ids = res.map((device) => {
      //   return device.id;
      // })
      // console.log('ids: ', ids);'
      res.forEach((device) => {
        setAllDevicesClassic((prevState: BluetoothDevice[]) => {
          if (!isDuplicteDeviceClassic(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        })
      })
    });
    // console.log('unpaired: ', unpaired);
    
    // try {
    //   let unpaired = RNBluetoothClassic.startDiscovery();
    //   console.log('unpaired: ', unpaired);
    // } catch (e) {
    //   console.log(e);
    // }
  }

  useEffect(() => {
    console.log('tags: ', tags);
    console.log('tags found: ', tags.length)
  }, [tags]);

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      // startStreamingData(deviceConnection);
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const connectToDeviceClassic = async (device: BluetoothDevice) => {
    try {
      const deviceConnection = await RNBluetoothClassic.connectToDevice(device.id);
      console.log('deviceConnection: ', deviceConnection);
      setConnectedDeviceClassic(deviceConnection);
      const onRecievedData = (event: BluetoothDeviceReadEvent) => {
        // event.data = data received from device is here
        // event.data.indexOf('EP:') > -1 checks for EP:, which indicates that the device has found a UHF tag
        if (event.data.indexOf('EP:') > -1) {
          // console.log('event.data: ', event.data);
          
          // console.log('event.data modified: ', event.data.replace('EP: ', ''))
          const foundTag = event.data.replace('EP: ', '');
          setTags((prevState: string[]) => {
            if (!prevState.includes(foundTag)) {
              return [...prevState, foundTag];
            }
            return prevState;
          }
          )
        }
      }
      deviceConnection.onDataReceived(async (data) => onRecievedData(data));
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setHeartRate(0);
    }
  };

  // const onHeartRateUpdate = (
  //   error: BleError | null,
  //   characteristic: Characteristic | null
  // ) => {
  //   if (error) {
  //     console.log(error);
  //     return -1;
  //   } else if (!characteristic?.value) {
  //     console.log("No Data was recieved");
  //     return -1;
  //   }

  //   const rawData = base64.decode(characteristic.value);
  //   let innerHeartRate: number = -1;

  //   const firstBitValue: number = Number(rawData) & 0x01;

  //   if (firstBitValue === 0) {
  //     innerHeartRate = rawData[1].charCodeAt(0);
  //   } else {
  //     innerHeartRate =
  //       Number(rawData[1].charCodeAt(0) << 8) +
  //       Number(rawData[2].charCodeAt(2));
  //   }

  //   setHeartRate(innerHeartRate);
  // };

  // const startStreamingData = async (device: Device) => {
  //   if (device) {
  //     device.monitorCharacteristicForService(
  //       HEART_RATE_UUID,
  //       HEART_RATE_CHARACTERISTIC,
  //       onHeartRateUpdate
  //     );
  //   } else {
  //     console.log("No Device Connected");
  //   }
  // };

  return {
    scanForPeripherals,
    scanForPeripheralsClassic,
    requestPermissions,
    connectToDevice,
    connectToDeviceClassic,
    allDevices,
    allDevicesClassic,
    connectedDevice,
    connectedDeviceClassic,
    disconnectFromDevice,
    heartRate,
    tags,
  };
}

export default useBLE;