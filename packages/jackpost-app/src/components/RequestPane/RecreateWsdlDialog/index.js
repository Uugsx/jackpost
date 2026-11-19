import React from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from 'components/Modal';
import { recreateWsdlRequest } from 'providers/ReduxStore/slices/collections/wsdl-refresh-actions';

const RecreateWsdlDialog = ({ collectionUid, itemUid, onClose }) => {
  const dispatch = useDispatch();

  const run = (keep) => {
    onClose();
    toast.promise(dispatch(recreateWsdlRequest(collectionUid, itemUid, { keep })), {
      loading: 'Recreating from schema…',
      success: keep ? 'Request recreated, values kept (unsaved)' : 'Request reset to clean sample (unsaved)',
      error: (e) => e.message || 'Failed'
    });
  };

  return (
    <Modal
      size="md"
      title="Recreate Request"
      confirmText="Yes"
      cancelText="No"
      handleConfirm={() => run(true)}
      handleCancel={(args) => (args && args.type === 'esc' ? onClose() : run(false))}
      disableEscapeKey={false}
      dataTestId="recreate-wsdl-dialog"
    >
      <div>Keep existing values?</div>
      <div className="text-xs mt-2 opacity-70">Yes — regenerate from schema, keeping the values you entered. No — reset to a clean sample. Esc — cancel.</div>
    </Modal>
  );
};

export default RecreateWsdlDialog;
