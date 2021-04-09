import { expect, assert } from "chai";
import { XsdSchemaConverter } from "./xsdSchemaConverter";

const xmlSchema = `
    <?xml version="1.0" encoding="UTF-8" ?>
    <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
        
        <xs:simpleType name="stringtype">
          <xs:restriction base="xs:string"/>
        </xs:simpleType>
        
        <xs:simpleType name="inttype">
          <xs:restriction base="xs:positiveInteger"/>
        </xs:simpleType>
        
        <xs:simpleType name="dectype">
          <xs:restriction base="xs:decimal"/>
        </xs:simpleType>
        
        <xs:simpleType name="orderidtype">
          <xs:restriction base="xs:string">
            <xs:pattern value="[0-9]{6}"/>
          </xs:restriction>
        </xs:simpleType>

        <xs:element name="submitCustomerOrder">
            <xs:complexType>
                <xs:sequence>
                    <xs:element name="submitCustomerOrderRequest" type="SomeUnknownType" />
                </xs:sequence>
            </xs:complexType>
        </xs:element>
        
        <xs:complexType name="shiptotype">
          <xs:sequence>
            <xs:element name="name" type="stringtype"/>
            <xs:element name="address" type="stringtype"/>
            <xs:element name="city" type="stringtype"/>
            <xs:element name="country" type="stringtype"/>
          </xs:sequence>
        </xs:complexType>
        
        <xs:complexType name="itemtype">
          <xs:sequence>
            <xs:element name="title" type="stringtype"/>
            <xs:element name="note" type="stringtype" minOccurs="0"/>
            <xs:element name="quantity" type="inttype"/>
            <xs:element name="price" type="dectype"/>
          </xs:sequence>
        </xs:complexType>
        
        <xs:complexType name="shipordertype">
          <xs:sequence>
            <xs:element name="orderperson" type="stringtype"/>
            <xs:element name="shipto" type="shiptotype"/>
            <xs:element name="item" maxOccurs="unbounded" type="itemtype"/>
          </xs:sequence>
          <xs:attribute name="orderid" type="orderidtype" use="required"/>
        </xs:complexType>
        
        <xs:element name="shiporder" type="shipordertype"/>
        
    </xs:schema>`;


describe("Schema converter", async () => {
    it("Converts XML schema to JSON scheme", async () => {
        const converter = new XsdSchemaConverter();
        const jsonSchema = converter.convertXsdSchema(xmlSchema);

        assert.strictEqual(jsonSchema.stringtype.type, "string");
        assert.strictEqual(jsonSchema.inttype.type, "positiveInteger");
        assert.strictEqual(jsonSchema.dectype.type, "decimal");
        assert.strictEqual(jsonSchema.orderidtype.type, "string");

        assert.strictEqual(jsonSchema.submitCustomerOrder.type, "object");
        assert.isDefined(jsonSchema.submitCustomerOrder.properties.submitCustomerOrderRequest);

        assert.strictEqual(jsonSchema.shipordertype.type, "object");
        assert.isDefined(jsonSchema.shipordertype.properties.orderperson);
        assert.isDefined(jsonSchema.shipordertype.properties.shipto);
        assert.isDefined(jsonSchema.shipordertype.properties.item);

        assert.strictEqual(jsonSchema.shiporder.type, "object");
        assert.strictEqual(jsonSchema.shiporder.$ref, "shipordertype");
    });
});