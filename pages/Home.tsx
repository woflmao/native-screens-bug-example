import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LogBox } from 'react-native';
// import DeviceModalClassic from '../DeviceConnectionModalClassic';
import DeviceModalClassic from '../DeviceConnectionModalClassic';
import useBLE from '../useBLE';


const Home = () => {
  LogBox.ignoreLogs(['new NativeEventEmitter']);
  const {
    requestPermissions,
    scanForPeripherals,
    scanForPeripheralsClassic,
    allDevices,
    allDevicesClassic,
    connectToDevice,
    connectToDeviceClassic,
    connectedDevice,
    connectedDeviceClassic,
    heartRate,
    disconnectFromDevice,
    tags,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      console.log('scanning');
      scanForPeripherals();
      scanForPeripheralsClassic();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };
  console.log('connected device: ', connectedDevice)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        {connectedDeviceClassic ? (
          <>
            <Text style={styles.heartRateTitleText}>Tags</Text>
            <FlatList
              data={tags}
              renderItem={({ item }) => (
                <Text style={styles.heartRateText}>{item}</Text>
              )}
              keyExtractor={(item) => item}
            />
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
            Please Connect to a Device
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}
      >
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? "Disconnect" : "Connect"}
        </Text>
      </TouchableOpacity>
      {/* <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      /> */}
      <DeviceModalClassic
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDeviceClassic}
        devices={allDevicesClassic}
      />
    </SafeAreaView>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
