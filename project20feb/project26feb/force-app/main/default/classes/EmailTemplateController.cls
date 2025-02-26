public with sharing class EmailTemplateController {

    /**
     * Author: Shivam Barya
     * description: fetching all the email templates from email template object
     * @return List<EmailTemplate>
     */
    @AuraEnabled
    public static EmailTemplate updateEmailTemplate(String templateId, String newBody, String newSubject) {
        EmailTemplate template = [
            SELECT Id, Body,HtmlValue, Subject
            FROM EmailTemplate
            WHERE Id = :templateId WITH USER_MODE
        ];
        template.HtmlValue = newBody;
        template.Subject = newSubject;
        System.debug('template+++++++++++++' + template);
        return template;
        // UPDATE AS USER template;
    }   
    @AuraEnabled
    public static List<EmailTemplate> getSobjectEmailTemplates(String objectName){
        return [SELECT Id, Name, Body,HtmlValue, DeveloperName, Owner.Email, Subject, FolderId, FolderName, RelatedEntityType
                FROM EmailTemplate 
                WHERE RelatedEntityType =:objectName WITH USER_MODE];
    }
    
    /**
     * Author: Shivam Barya
     * description: fetching all the sobject name from schema class
     * @return List<Object>
     */
    @AuraEnabled(cacheable=true)
    public static List<Object> fetchAllObject(){
        List<Schema.SObjectType> gd = Schema.getGlobalDescribe().Values();
        List<Object> objName = new List<String>();
        for(Schema.SObjectType f : gd){
            objName.add(f.getDescribe().getName()); 
        }
        return objName;
    }

    /**
     *  Author: Shivam Barya
     * description: fetching all the sobject label and api name from schema class
     * @param objectName: the object name
     * @return Map<String, String>
     */
    
    @AuraEnabled
    public static Map<String, String> fetchSobjectFields(String objectName){
        try {
            Map<String, String> allSObjects = new Map<String, String>();
            Map<String, SObjectType> gd = Schema.getGlobalDescribe();
            Schema.SObjectType sobjectype = gd.get(objectName);
            Schema.DescribeSObjectResult res = sobjectype.getDescribe();
            Map<String, Schema.SObjectField> fiedlApiName = res.fields.getMap();
            for(String fieldName : fiedlApiName.keySet()){
                Schema.SObjectField field = fiedlApiName.get(fieldName);
                Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
                allSObjects.put(fieldDescribe.getLabel() , fieldDescribe.getName());
            }
            return allSObjects;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}