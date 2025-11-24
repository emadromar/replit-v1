import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';

export function VisualProductPicker({ products, selectedProductId, onChange }) {
    const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

    return (
        <div className="w-full">
            <Listbox value={selectedProductId} onChange={onChange}>
                <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-3 pr-10 text-left border border-gray-200 shadow-sm focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm hover:border-gray-300 transition-colors">
                        <span className="block truncate">
                            {selectedProduct ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                        {selectedProduct.imageUrl ? (
                                            <ProductImage
                                                src={selectedProduct.imageUrl}
                                                alt={selectedProduct.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-900">{selectedProduct.name}</span>
                                </div>
                            ) : (
                                <span className="text-gray-500">Select a product...</span>
                            )}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={React.Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                            {products.map((product) => (
                                <Listbox.Option
                                    key={product.id}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                                        }`
                                    }
                                    value={product.id}
                                >
                                    {({ selected }) => (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                                                    {product.imageUrl ? (
                                                        <ProductImage
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                        }`}
                                                >
                                                    {product.name}
                                                </span>
                                            </div>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                                                    <Check className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
