// https://developer.scrypted.app/#getting-started
// package.json contains the metadata (name, interfaces) about this device
// under the "scrypted" key.
import sdk, { Device, DeviceProvider, ScryptedDeviceBase, ScryptedDeviceType, Settings, Setting } from '@scrypted/sdk';
import { Auth, createConnection, subscribeEntities, Connection } from "home-assistant-js-websocket";
import { HassBase } from './base';
const { deviceManager } = sdk;

var entityTypes = {};

function addEntityType(type: string, scryptedType: ScryptedDeviceType, clazz: any) {
    entityTypes[type] = {
        scryptedType,
        clazz,
    };
}
addEntityType('light', ScryptedDeviceType.Light, require('./light').default);
addEntityType('switch', ScryptedDeviceType.Switch, require('./switch').default);
addEntityType('lock', ScryptedDeviceType.Lock, require('./lock').default);

class Hass extends ScryptedDeviceBase implements DeviceProvider, Settings {
    devices: Map<String, HassBase> = new Map();
    connection: Connection;
    constructor() {
        super();

        this.connect();
    }
    discoverDevices(duration: number): void {
    }
    getSettings(): Setting[] {
        return [
            {
                title: "Long Lived Access Token",
                key: "access_token",
                type: "password",
                value: localStorage.getItem('access_token'),
            },
        ]
    }
    putSetting(key: string, value: string | number | boolean): void {
        localStorage.setItem(key, value.toString());
        if (key === 'access_token') {
            this.connect();
        }
    }
    async connect() {
        var access_token = localStorage.getItem('access_token');
        if (!access_token) {
            this.log.a("Please provide an access token in Settings.")
            return;
        }

        if (this.connection) {
            this.connection.close();
            this.connection = undefined;
        }

        let auth = new Auth({
            access_token,
            // Set expires to very far in the future
            expires: new Date(new Date().getTime() + 1e11),
            hassUrl: "http://192.168.2.7:8123",
        });

        const connection = await createConnection({ auth });
        subscribeEntities(connection, entities => {
            var deviceFound = false;
            // build up a device manifest every time.
            const devices = Object.values(entities)
            // find the type
                .map(entity => ({
                    type: entityTypes[entity.entity_id.split('.')[0]],
                    entity: entity, 
                }))
                // filter nulls
                .filter(pair => pair.type)
                // map to scrypted devices
                .map(pair => {
                    const {entity, type} = pair;

                    var scryptedDevice: HassBase = this.devices.get(entity.entity_id);
                    if (!scryptedDevice) {
                        deviceFound = true;
                        scryptedDevice = new pair.type.clazz(connection, entity);
                        this.devices.set(entity.entity_id, scryptedDevice);
                    }

                    var device: Device = {
                        name: entity.attributes.friendly_name,
                        nativeId: entity.entity_id,
                        type: type.scryptedType,
                        interfaces: scryptedDevice.getInterfaces(),
                    }

                    setImmediate(() => scryptedDevice.updateState(pair.entity));
                    return device;
                });

            // only trigger a change if a new device was found.
            if (deviceFound) {
                deviceManager.onDevicesChanged({
                    devices
                });
            }
        });
    }

    getDevice(nativeId: string): object {
        return this.devices.get(nativeId);
    }
}

export default new Hass();
