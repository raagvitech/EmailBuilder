import { api} from 'lwc';
import LightningModal from 'lightning/modal';

export default class CustomModal extends LightningModal {

    @api content;

    handleOkay() {
        this.close('okay');
    }
}