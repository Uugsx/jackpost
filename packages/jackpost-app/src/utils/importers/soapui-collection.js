import { JackpostError } from 'utils/common/error';
import { formatXml } from 'utils/xml-tools';
import { soapuiToJackpost, isSoapUIProject } from '@jackpost/converters';

const prettifyBodies = (items = []) => {
  items.forEach((item) => {
    const body = item.request && item.request.body;
    if (body && typeof body.xml === 'string') body.xml = formatXml(body.xml);
    if (Array.isArray(item.items)) prettifyBodies(item.items);
  });
};

export const isSoapUICollection = (data) => isSoapUIProject(data);

export const convertSoapUIToJackpost = async (data) => {
  try {
    const collection = await soapuiToJackpost(data);
    prettifyBodies(collection.items);
    return collection;
  } catch (err) {
    console.error('Error converting SoapUI project to Jackpost:', err);
    throw new JackpostError(err.message);
  }
};
