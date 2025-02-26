import { LightningElement, track, wire } from 'lwc';
import fetchAllObject from '@salesforce/apex/EmailTemplateController.fetchAllObject';
import fetchSobjectFields from '@salesforce/apex/EmailTemplateController.fetchSobjectFields';
import getSobjectEmailTemplates from '@salesforce/apex/EmailTemplateController.getSobjectEmailTemplates';
import updateEmailTemplate from '@salesforce/apex/EmailTemplateController.updateEmailTemplate';




export default class MergeField extends LightningElement {

    optObject;
    allRecord;
    options;
    objectFields;
    optObjectField;
    optionsField;
    objectFieldRecord;
    templateRecords;
    templateId;
    @track templateContent;
    templateSubject;
    templateBody;

    @wire(fetchAllObject)
    wiredFetchObject({ data, error }) {
        if (data) {
            this.allRecord = data;
            this.options = this.allRecord.map(value => ({ label: value, value: value })).sort((a, b) => a.label.localeCompare(b.label));
        }
        else if (error) {
            this.error = error;
        }
    }

    handleKeyChange(event) {
        this.templateContent = ''
        this.optObject = event.target.value;
        this.handleObjectFields();
        if (this.optObject) {
            this.handleEmailTemplate();
        }
    }

    async handleObjectFields() {
        this.objectFields = await fetchSobjectFields({ objectName: this.optObject });
        this.objectFieldRecord = Object.entries(this.objectFields).map(([objectLabel, objectFieldApiName]) => ({
            objectLabel,
            objectFieldApiName
        }));
        this.optionsField = this.objectFieldRecord.map(item => {
            return {
                label: item.objectLabel,
                value: item.objectFieldApiName
            }
        })
    }

    async handleEmailTemplate() {
        this.templateRecords = await getSobjectEmailTemplates({ objectName: this.optObject });
        console.log('templateRecords: ' + JSON.stringify(this.templateRecords));
    }

    handleFieldChange(event) {
        this.optObjectField = event.target.value;
    }

    handleTemplate(event) {
        this.templateId = event.target.dataset.id;
        const badgeValue = this.templateRecords.find(item => item.Id === event.target.dataset.id);
        if (badgeValue) {
            this.templateContent = event.target.dataset.value;
            this.templateSubject = event.target.dataset.subject;
        }
        const selectedBadge = this.template.querySelector(`lightning-badge[data-id="${this.templateId}"]`);
        selectedBadge.classList.add('badge-blue');
        const allBadges = this.template.querySelectorAll('lightning-badge');
        allBadges.forEach(badge => {
            if (badge.dataset.id !== this.templateId) {
                badge.classList.remove('badge-blue');
            }
        });
    }

    handleSave() {
        const newSubject = this.template.querySelector('.subject').value;
        const newBody = this.template.querySelector('.body').value;
        console.log('templateId: ' + this.templateId);
        console.log('templateSubject: ' + JSON.stringify(newSubject));
        console.log('templateContent:' + JSON.stringify(newBody));
        updateEmailTemplate({
            templateId: this.templateId,
            newBody: newBody,
            newSubject: newSubject
        })
            .then(result => {
                console.log('result: ' + JSON.stringify(result));
                console.log('Email Template updated successfully');
            })
            .catch(error => {
                console.error('Error updating Email Template:', error);
            });

    }
}