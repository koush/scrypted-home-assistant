import { callService, Connection, HassEntity } from "home-assistant-js-websocket";
import { ScryptedInterface, Lock, LockState } from "../../scrypted-deploy";
import { HassBase } from "./base";


class HassSwitch extends HassBase implements Lock {
    constructor(connection: Connection, entity: HassEntity) {
        super(connection, entity);
    }
    unlock(): void {
        callService(this.connection, "homeassistant", "async_unlock", {
            entity_id: this.nativeId
        });
    }
    lock(): void {
        callService(this.connection, "homeassistant", "async_lock", {
            entity_id: this.nativeId
        });
    }
    getInterfaces(): string[] {
        return [ScryptedInterface.OnOff];
    }
    updateState(entity: HassEntity) {
        this.lockState = entity.state === 'locked' ? LockState.Locked : LockState.Unlocked;
    }
}

export default HassSwitch;