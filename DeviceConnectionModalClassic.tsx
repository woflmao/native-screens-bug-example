import React, { FC, useCallback } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Device } from "react-native-ble-plx";
import { BluetoothDevice } from 'react-native-bluetooth-classic';

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

type DeviceModalListItemPropsClassic = {
  item: ListRenderItemInfo<BluetoothDevice>;
  connectToPeripheralClassic: (device: BluetoothDevice) => void;
  closeModal: () => void;
};

type DeviceModalProps = {
  devices: BluetoothDevice[];
  visible: boolean;
  connectToPeripheral: (device: BluetoothDevice) => void;
  closeModal: () => void;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { item, connectToPeripheral, closeModal } = props;

  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(item.item);
    closeModal();
  }, [closeModal, connectToPeripheral, item.item]);
  // console.log(`item id: ${item.item.id}, item name: ${item.item.name}`);
  // console.log(item.item.id === '88:6B:0F:3E:82:9B');
  // console.log('item.item.name: ', item.item.name);
  // 88:6B:0F:3E:82:9B
  return (
    <TouchableOpacity
      onPress={connectAndCloseModal}
      style={modalStyle.ctaButton}
    >
      <Text style={modalStyle.ctaButtonText}>{item.item.id}</Text>
    </TouchableOpacity>
  );
};

const DeviceModalListItemClassic: FC<DeviceModalListItemPropsClassic> = (props) => {
  const { item, connectToPeripheralClassic, closeModal } = props;

  const connectAndCloseModal = useCallback(() => {
    connectToPeripheralClassic(item.item);
    closeModal();
  }, [closeModal, connectToPeripheralClassic, item.item]);
  return (
    <TouchableOpacity
      onPress={connectAndCloseModal}
      style={modalStyle.ctaButton}
    >
      <Text style={modalStyle.ctaButtonText}>{item.item.name}</Text>
    </TouchableOpacity>
  );
};

const DeviceModalClassic: FC<DeviceModalProps> = (props) => {
  const { devices, visible, connectToPeripheral, closeModal } = props;
  // console.log('devices: ', devices);
  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<BluetoothDevice>) => {
      return (
        <DeviceModalListItemClassic
          item={item}
          connectToPeripheralClassic={connectToPeripheral}
          closeModal={closeModal}
        />
      );
    },
    [closeModal, connectToPeripheral]
  );
  return (
    <Modal
      style={modalStyle.modalContainer}
      animationType="slide"
      transparent={false}
      visible={visible}
    >
      <SafeAreaView style={modalStyle.modalTitle}>
        <Text style={modalStyle.modalTitleText}>
          Tap on a device to connect
        </Text>
        <FlatList
          contentContainerStyle={modalStyle.modalFlatlistContiner}
          data={devices}
          renderItem={renderDeviceModalListItem}
        />
      </SafeAreaView>
    </Modal>
  );
};

const modalStyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  modalFlatlistContiner: {
    flex: 1,
    justifyContent: "center",
  },
  modalCellOutline: {
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  modalTitle: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  modalTitleText: {
    marginTop: 40,
    fontSize: 30,
    fontWeight: "bold",
    marginHorizontal: 20,
    textAlign: "center",
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

export default DeviceModalClassic;