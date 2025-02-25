import { LightningElement, track } from 'lwc';
import getEmailTemplates from '@salesforce/apex/EmailTemplateController.getEmailTemplates';
import getRelatedFields from '@salesforce/apex/EmailTemplateController.getRelatedFields';

export default class ObjectEmailTemplateDragDrop extends LightningElement {
    @track currentStep = 1;
    @track emailTemplates = [];
    @track selectedEmailTemplateId = '';
    @track selectedEmailTemplate = {};
    @track relatedFields = [];
    @track emailBodyContent = '';

    // New properties for preview step
    @track emailFrom = 'jagadeesh.boddepalli@raagvitech.com';
    @track emailTo = 'recipient@example.com';
    @track emailCc = '';
    @track emailBcc = '';

    get isInitialStep() {
        return this.currentStep === 1;
    }
    get isTemplateSelectionStep() {
        return this.currentStep === 2;
    }
    get isEditingStep() {
        return this.currentStep === 3;
    }
    get isPreviewStep() {
        return this.currentStep === 4;
    }
    get emailTemplateOptions() {
        return this.emailTemplates.map(template => ({
            label: template.Name,
            value: template.Id
        }));
    }

    loadTemplates() {
        getEmailTemplates()
            .then(result => {
                this.emailTemplates = result;
                this.currentStep = 2;
            })
            .catch(error => {
                console.error('Error fetching email templates:', error);
            });
    }

    handleTemplateChange(event) {
        this.selectedEmailTemplateId = event.detail.value;
        this.selectedEmailTemplate = this.emailTemplates.find(
            template => template.Id === this.selectedEmailTemplateId
        );

        getRelatedFields({ templateId: this.selectedEmailTemplateId })
            .then(fields => {
                this.relatedFields = fields;
                this.emailBodyContent = this.selectedEmailTemplate.Body || '';
                this.currentStep = 3;
            })
            .catch(error => {
                console.error('Error fetching related fields:', error);
            });
    }

    handleDragStart(event) {
        event.dataTransfer.setData('text', event.target.dataset.id);
    }
    handleDragOver(event) {
        event.preventDefault();
    }
    
    handleDrop(event) {
        event.preventDefault();
        const fieldApiName = event.dataTransfer.getData('text');
    
        // Append the merge field at the cursor position or at the end
        this.emailBodyContent += ` {{${fieldApiName}}} `;
    
        // Force a refresh to make sure it's updated in the UI
        this.emailBodyContent = this.emailBodyContent.trim();
    }

    handleRichTextChange(event) {
        this.emailBodyContent = event.detail.value;
    }

    // Navigate to Preview Step
   // Prepopulate 'From' based on the selected template
   goToPreview() {
    if (this.selectedEmailTemplate.FromAddress) {
        this.emailFrom = this.selectedEmailTemplate.FromAddress;
    }
    this.currentStep = 4;
}


    goToTemplateSelection() {
        this.currentStep = 2;
    }

    goToEditing() {
        this.currentStep = 3;
    }

    handleFromChange(event) { this.emailFrom = event.target.value; }
    handleToChange(event) { this.emailTo = event.target.value; }
    handleCcChange(event) { this.emailCc = event.target.value; }
    handleBccChange(event) { this.emailBcc = event.target.value; }

    sendEmail() {
        sendEmailApex({
            fromAddress: this.emailFrom,
            toAddress: this.emailTo,
            ccAddress: this.emailCc,
            bccAddress: this.emailBcc,
            subject: this.selectedEmailTemplate.Subject,
            body: this.emailBodyContent
        })
        .then(() => {
            alert('Email Sent Successfully!');
        })
        .catch(error => {
            console.error('Error sending email:', error);
        });
    }
}
