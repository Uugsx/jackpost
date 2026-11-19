import { describe, it, expect } from '@jest/globals';
import { wsdlToMockOperations } from '../../src/wsdl/wsdl-to-jackpost';

const wsdl = `<?xml version="1.0"?>
<wsdl:definitions name="Calc" targetNamespace="http://e.com/c"
  xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:tns="http://e.com/c">
  <wsdl:types><xsd:schema targetNamespace="http://e.com/c" elementFormDefault="qualified">
    <xsd:element name="Add"><xsd:complexType><xsd:sequence><xsd:element name="a" type="xsd:int"/></xsd:sequence></xsd:complexType></xsd:element>
    <xsd:element name="AddResponse"><xsd:complexType><xsd:sequence><xsd:element name="sum" type="xsd:int"/></xsd:sequence></xsd:complexType></xsd:element>
  </xsd:schema></wsdl:types>
  <wsdl:message name="AddIn"><wsdl:part name="p" element="tns:Add"/></wsdl:message>
  <wsdl:message name="AddOut"><wsdl:part name="p" element="tns:AddResponse"/></wsdl:message>
  <wsdl:portType name="CalcPT"><wsdl:operation name="Add"><wsdl:input message="tns:AddIn"/><wsdl:output message="tns:AddOut"/></wsdl:operation></wsdl:portType>
  <wsdl:binding name="CalcB" type="tns:CalcPT"><soap:binding transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="Add"><soap:operation soapAction="http://e.com/c/Add"/></wsdl:operation></wsdl:binding>
  <wsdl:service name="CalcSvc"><wsdl:port name="P" binding="tns:CalcB"><soap:address location="http://localhost/calc"/></wsdl:port></wsdl:service>
</wsdl:definitions>`;

describe('wsdlToMockOperations', () => {
  it('returns operations with sample response', async () => {
    const ops = await wsdlToMockOperations(wsdl);
    expect(ops).toHaveLength(1);
    expect(ops[0].name).toBe('Add');
    expect(ops[0].soapAction).toBe('http://e.com/c/Add');
    expect(ops[0].requestElement).toBe('Add');
    expect(ops[0].response).toContain('AddResponse');
    expect(ops[0].response).toContain(':sum>');
  });
});
