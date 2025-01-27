import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

interface UsernameModalProps {
isOpen: boolean;
onSubmit: (username: string) => void;
}

interface PasswordModalProps {
isOpen: boolean;
onSubmit: (password: string) => void;
onClose: () => void;
}

interface AlertModalProps {
 isOpen: boolean;
 onClose: () => void;
 onConfirm?: () => void;
 title: string;
 message: string;
 type: 'warning' | 'error';
}

export const UsernameModal = ({ isOpen, onSubmit }: UsernameModalProps) => {
const [inputValue, setInputValue] = useState('');

const handleSubmit = (username: string) => {
  onSubmit(username);
  setInputValue('');
};

return (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-10" onClose={() => {}}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-white mb-4"
              >
                Enter Username
              </Dialog.Title>
              <div className="mt-2">
                <input
                  type="text"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none"
                  placeholder="Your username..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(inputValue)}
                />
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                  onClick={() => handleSubmit(inputValue)}
                >
                  Continue
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);
};

export const PasswordModal = ({ isOpen, onSubmit, onClose }: PasswordModalProps) => {
const [password, setPassword] = useState('');

const handleSubmit = (pwd: string) => {
  onSubmit(pwd);
  setPassword('');
};

const handleClose = () => {
  onClose();
  setPassword('');
};

return (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-10" onClose={handleClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-white mb-4"
              >
                Enter Room Password
              </Dialog.Title>
              <div className="mt-2">
                <input
                  type="password"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-gray-500 focus:outline-none"
                  placeholder="Room password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit(password)}
                />
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                  onClick={() => handleSubmit(password)}
                >
                  Join Room
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);
};

export const AlertModal = ({ 
 isOpen, 
 onClose, 
 onConfirm, 
 title, 
 message, 
 type 
}: AlertModalProps) => {
 return (
   <Transition appear show={isOpen} as={Fragment}>
     <Dialog as="div" className="relative z-10" onClose={onClose}>
       <Transition.Child
         as={Fragment}
         enter="ease-out duration-300"
         enterFrom="opacity-0"
         enterTo="opacity-100"
         leave="ease-in duration-200"
         leaveFrom="opacity-100"
         leaveTo="opacity-0"
       >
         <div className="fixed inset-0 bg-black bg-opacity-25" />
       </Transition.Child>

       <div className="fixed inset-0 overflow-y-auto">
         <div className="flex min-h-full items-center justify-center p-4">
           <Transition.Child
             as={Fragment}
             enter="ease-out duration-300"
             enterFrom="opacity-0 scale-95"
             enterTo="opacity-100 scale-100"
             leave="ease-in duration-200"
             leaveFrom="opacity-100 scale-100"
             leaveTo="opacity-0 scale-95"
           >
             <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
               <div className="flex items-center gap-3 mb-4">
                 {type === 'warning' ? (
                   <AlertTriangle className="h-6 w-6 text-yellow-500" />
                 ) : (
                   <XCircle className="h-6 w-6 text-red-500" />
                 )}
                 <Dialog.Title as="h3" className="text-lg font-medium text-white">
                   {title}
                 </Dialog.Title>
               </div>
               
               <div className="mt-2">
                 <p className="text-gray-300">
                   {message}
                 </p>
               </div>

               <div className="mt-4 flex gap-4">
                 <button
                   type="button"
                   className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                   onClick={onClose}
                 >
                   Cancel
                 </button>
                 {onConfirm && (
                   <button
                     type="button"
                     className={`flex-1 ${
                       type === 'warning'
                         ? 'bg-gray-800 hover:bg-gray-700'
                         : 'bg-gray-800 hover:bg-gray-700'
                     } text-white font-medium py-2 px-4 rounded-lg transition duration-200`}
                     onClick={onConfirm}
                   >
                     Confirm
                   </button>
                 )}
               </div>
             </Dialog.Panel>
           </Transition.Child>
         </div>
       </div>
     </Dialog>
   </Transition>
 );
};