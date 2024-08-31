import { LightningElement, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import Type_FIELD from '@salesforce/schema/Account.Type';
import { gql, graphql } from "lightning/uiGraphQLApi";

export default class GraphQLExample extends LightningElement {
    @track valueType = 'Technology Partner';
    @track records;
    @track errors;

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    objectInfo;

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: Type_FIELD})
    TypePicklistValues;

    handleChange(event) {
        this.value = event.detail.value;
    }

    @wire(graphql, {
        query: gql`
          query casesWithAcc ($valueType:String ) {
            uiapi {
              query {
                Case(where: { Account_Type__c:  { eq: $valueType }  }) {
                    edges {
                        node {
                            Id
                            CaseNumber {
                                value
                            }
                            Status {
                                displayValue
                            }
                            Account_Type__c  {
                                value
                            }   
                        }
                    } 
                }
              }
            }
          }
        `,
        variables: "$variables", // Use a getter function to make the variables reactive
      })
        graphqlQueryResult({ data, errors }) {
            if (data) {
                console.log(`data ${JSON.stringify(data)}`)
                this.records = data.uiapi.query.Case.edges.map((edge) => edge.node);
            }
            console.log(`error ${JSON.stringify(errors)}`)
            this.errors = errors;
        }
    
    get variables() {
        return {
            valueType: this.valueType
        };
    }
        
    handleTypeChange(event){
        console.log(`valueType ${event.detail.value}`)
        this.valueType = event.detail.value;
    }

}