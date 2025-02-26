import { LightningElement , track} from 'lwc';
import getEmailTemplates from '@salesforce/apex/EmailTemplateController.getEmailTemplates';

export default class ObjectEmailTemplateDragDrop extends LightningElement {

  // STEP 1: Object Selection
  @track selectedObject = '';
  @track relatedFields = [];
  @track objectOptions = [
      { label: 'Account', value: 'Account' },
      { label: 'Contact', value: 'Contact' },
      { label: 'Case', value: 'Case' }
  ];

  // STEP 2: Email Template Selection
  @track emailTemplates = []; 
  @track selectedEmailTemplateId = '';
  @track selectedEmailTemplate = {};
  @track errorMessage = '';

  // STEP 3: Drag & Drop (Email Body Editor)
  @track droppedFields = [];
  @track emailBodyContent = '';

  @track currentStep = 1;

  // -------------------------------
  // GETTERS: For Wizard Navigation
  // -------------------------------
  get isStepOne() {
      return this.currentStep === 1;
  }
  get isStepTwo() {
      return this.currentStep === 2;
  }
  get isStepThree() {
      return this.currentStep === 3;
  }
  get isNextDisabled() {
      return !this.selectedObject;
  }
  get emailTemplateOptions() {
      return this.emailTemplates.map(template => {
          return { label: template.Name, value: template.Id };
      });
  }
  get isNextTemplateDisabled() {
      return !this.selectedEmailTemplateId;
  }

  // -------------------------------
  // HANDLERS: STEP 1 - Object Selection
  // -------------------------------
  handleObjectChange(event) {
      this.selectedObject = event.detail.value;
      // Load fields based on the chosen object
      this.loadFieldsForObject(this.selectedObject);
      // Reset previous selections and content
      this.selectedEmailTemplateId = '';
      this.selectedEmailTemplate = {};
      this.emailTemplates = [];
      this.errorMessage = '';
      this.droppedFields = [];
      this.emailBodyContent = '';
  }

  loadFieldsForObject(objectName) {
      if (objectName === 'Account') {
          this.relatedFields = [
              { fieldApiName: 'Name', label: 'Account Name' },
              { fieldApiName: 'Industry', label: 'Industry' },
              { fieldApiName: 'AnnualRevenue', label: 'Annual Revenue' }
          ];
      } else if (objectName === 'Contact') {
          this.relatedFields = [
              { fieldApiName: 'FirstName', label: 'First Name' },
              { fieldApiName: 'LastName', label: 'Last Name' },
              { fieldApiName: 'Email', label: 'Email' }
          ];
      } else if (objectName === 'Case') {
          this.relatedFields = [
              { fieldApiName: 'CaseNumber', label: 'Case Number' },
              { fieldApiName: 'Status', label: 'Status' },
              { fieldApiName: 'Priority', label: 'Priority' }
          ];
      } else {
          this.relatedFields = [];
      }
  }

  // -------------------------------
  // WIZARD NAVIGATION METHODS
  // -------------------------------
  goToStepOne() {
      this.currentStep = 1;
  }

  goToStepTwo() {
      if (this.selectedObject) {
          getEmailTemplates({ relatedEntityType: this.selectedObject })
              .then(result => {
                  if (result && result.length > 0) {
                      this.emailTemplates = result;
                      this.errorMessage = '';
                      this.currentStep = 2;
                  } else {
                      this.errorMessage = 'No email templates available for the selected object.';
                  }
              })
              .catch(error => {
                  console.error('Error fetching email templates', error);
                  this.errorMessage = 'Error fetching email templates.';
              });
      }
  }

  goToStepThree() {
      if (this.selectedEmailTemplateId) {
          // Find the selected template from the fetched list
          this.selectedEmailTemplate = this.emailTemplates.find(
              template => template.Id === this.selectedEmailTemplateId
          ) || {};
          // Initialize the rich text editor with the existing body
          this.emailBodyContent = this.selectedEmailTemplate.Body || '';
          this.currentStep = 3;
      }
  }

  handleTemplateChange(event) {
      this.selectedEmailTemplateId = event.detail.value;
  }

  // -------------------------------
  // DRAG & DROP HANDLERS
  // -------------------------------
  handleDragStart(event) {
      event.dataTransfer.setData('fieldId', event.target.dataset.id);
  }

  handleDragOver(event) {
      event.preventDefault();
  }

  handleDrop(event) {
      event.preventDefault();
      const fieldId = event.dataTransfer.getData('fieldId');
      const field = this.relatedFields.find(f => f.fieldApiName === fieldId);
      if (field) {
          // Prevent duplicate insertion in the dropped fields list
          if (!this.droppedFields.some(f => f.fieldApiName === field.fieldApiName)) {
              this.droppedFields = [...this.droppedFields, field];
              // Instead of adding delimiters like << >>, insert a styled span
              const mergeFieldHTML = `<span class="merge-field" data-field="${field.fieldApiName}" style="background-color: #e0e0e0; padding: 2px 4px; border-radius: 4px; margin: 0 2px;">${field.label}</span>`;
              // Append the HTML to the existing email body content
              this.emailBodyContent = this.emailBodyContent + mergeFieldHTML;
          }
      }
  }

  // Handler for changes in the rich text editor
  handleRichTextChange(event) {
      this.emailBodyContent = event.detail.value;
  }

  // -------------------------------
  // FINALIZE THE EMAIL TEMPLATE
  // -------------------------------
  finishWizard() {
      // Combine the subject and the edited email body content
      const finalEmail = `${this.selectedEmailTemplate.Subject}\n\n${this.emailBodyContent}`;
      console.log('Final Email Content:', finalEmail);
      // Further processing (e.g., saving or sending the email) can be done here
  }

}