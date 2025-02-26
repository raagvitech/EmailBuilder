public with sharing class EmailTemplateController {
    @AuraEnabled(cacheable=true)
    public static List<EmailTemplate> getEmailTemplates(String relatedEntityType) { 
        // Query email templates where the RelatedEntityType field matches the provided value
        return [
            SELECT Id, Name, DeveloperName, FolderName, TemplateType, Subject, Body, RelatedEntityType 
            FROM EmailTemplate 
            WHERE RelatedEntityType = :relatedEntityType
        ];
    }

    /**
     * Author: Shivam Barya  
     * getSobjectEmailTemplates: get the related email templates where the RelatedEntityType field matches the provided value.
     * 
     * @param {String} objectName - name of the object
     * @return {List<EmailTemplate>}
     */
    @AuraEnabled
    public static List<EmailTemplate> getSobjectEmailTemplates(String objectName){ 
        return [SELECT Id, Name, Body,HtmlValue, DeveloperName, Owner.Email, Subject, FolderId, FolderName, RelatedEntityType
                FROM EmailTemplate 
                WHERE RelatedEntityType =:objectName WITH USER_MODE];
    }

    /**
     * Author: Shivam Barya  
     * fetchAllObects: fetch all the SObject.
     * @return {List<Object>}
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
     * Author: Shivam Barya  
     * fetchAllObects: fetch all the SObject field label and field api name based on the Sobject type.
     * @param {String} objectName - name of the object
     * @return {List<String>}
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