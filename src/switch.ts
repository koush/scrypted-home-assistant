import { callService, Connection, HassEntity } from "home-assistant-js-websocket";
import { OnOff, ScryptedInterface } from "../../scrypted-deploy";
import { HassBase } from "./base";


class HassSwitch extends HassBase implements OnOff {
    constructor(connection: Connection, entity: HassEntity) {
        super(connection, entity);
    }
    turnOff(): void {
        callService(this.connection, "homeassistant", "turn_off", {
            entity_id: this.nativeId
        });
    }
    turnOn(): void {
        callService(this.connection, "homeassistant", "turn_on", {
            entity_id: this.nativeId
        });
    }
    getInterfaces(): string[] {
        return [ScryptedInterface.OnOff];
    }
    updateState(entity: HassEntity) {
        this.on = entity.state === 'on';
    }
}

export default HassSwitch;