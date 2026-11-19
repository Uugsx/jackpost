import React, { useMemo, useState } from 'react';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import { IconChevronDown } from '@tabler/icons';
import MenuDropdown from 'ui/MenuDropdown';
import TextInput from 'ui/TextInput';
import Modal from 'components/Modal';
import { requestUrlChanged } from 'providers/ReduxStore/slices/collections';
import { saveSoapEndpoints } from 'providers/ReduxStore/slices/collections/actions';

const NO_ENDPOINTS = [];

const EndpointDialog = ({ title, initialValue, onSubmit, onClose }) => {
  const [value, setValue] = useState(initialValue);
  const address = value.trim();

  return (
    <Modal
      size="md"
      title={title}
      confirmText="OK"
      confirmDisabled={!address}
      handleConfirm={() => onSubmit(address)}
      handleCancel={onClose}
      dataTestId="soap-endpoint-dialog"
    >
      <TextInput
        id="soap-endpoint-address"
        label="Endpoint address"
        value={value}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        data-testid="soap-endpoint-input"
      />
    </Modal>
  );
};

// Lets a SOAP call be switched between the addresses its WSDL declares; the list is shared by the whole collection.
const SoapEndpointSelector = ({ item, collection, url }) => {
  const dispatch = useDispatch();
  const [dialog, setDialog] = useState(null);
  const endpoints = get(collection, 'jackpostConfig.soapEndpoints', NO_ENDPOINTS);
  const current = url.trim();
  const isCurrentListed = endpoints.includes(current);

  const selectEndpoint = (address) => {
    dispatch(requestUrlChanged({ itemUid: item.uid, collectionUid: collection.uid, url: address }));
  };

  const addEndpoint = (address) => {
    dispatch(saveSoapEndpoints(collection.uid, [...endpoints, address]));
    selectEndpoint(address);
    setDialog(null);
  };

  const editCurrent = (address) => {
    const next = isCurrentListed ? endpoints.map((endpoint) => (endpoint === current ? address : endpoint)) : [...endpoints, address];
    dispatch(saveSoapEndpoints(collection.uid, next));
    selectEndpoint(address);
    setDialog(null);
  };

  const deleteCurrent = () => {
    dispatch(saveSoapEndpoints(collection.uid, endpoints.filter((endpoint) => endpoint !== current)));
  };

  const menuItems = useMemo(() => [
    ...endpoints.map((address) => ({
      id: address,
      label: address,
      onClick: () => selectEndpoint(address)
    })),
    { id: 'divider', type: 'divider' },
    { id: 'edit-current', label: '[edit current..]', testId: 'soap-endpoint-edit', onClick: () => setDialog('edit') },
    { id: 'add-new', label: '[add new endpoint..]', testId: 'soap-endpoint-add', onClick: () => setDialog('add') },
    { id: 'delete-current', label: '[delete current]', testId: 'soap-endpoint-delete', disabled: !isCurrentListed, onClick: deleteCurrent }
  ], [endpoints, current, isCurrentListed, item.uid, collection.uid]);

  return (
    <>
      <MenuDropdown items={menuItems} placement="bottom-end" selectedItemId={isCurrentListed ? current : undefined} data-testid="soap-endpoint-selector">
        <div className="flex items-center cursor-pointer" title="Endpoints" data-testid="soap-endpoint-trigger">
          <IconChevronDown size={18} strokeWidth={1.5} />
        </div>
      </MenuDropdown>
      {dialog === 'add' && <EndpointDialog title="Add Endpoint" initialValue="" onSubmit={addEndpoint} onClose={() => setDialog(null)} />}
      {dialog === 'edit' && <EndpointDialog title="Edit Endpoint" initialValue={current} onSubmit={editCurrent} onClose={() => setDialog(null)} />}
    </>
  );
};

export default SoapEndpointSelector;
