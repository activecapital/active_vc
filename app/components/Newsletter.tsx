'use client'
import React, { useState, FormEvent, ChangeEvent } from 'react'
import { track } from '@vercel/analytics'
import { sha256 } from '../src/utils/hashString'

import { faintBorder } from "../src/cssClasses"
import { UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const containerStyles = `grid grid-cols-1
      w-full
      min-h-[100px]
      ${faintBorder} rounded-[24px]
      py-6 px-8
      items-center`

const baseInputFieldStyles = `block w-full
    rounded-md border py-2 pl-10 pr-3
    shadow-sm sm:text-sm
    bg-[rgba(255,255,255,0.05)]
    text-white placeholder-gray-400
    focus:border-white focus:ring-indigo-500`

const Newsletter = () => {
  const [firstName, setFirstName] = useState<string>('')
  const [email, setEmail] = useState<string>('')

  const [firstNameError, setFirstNameError] = useState<string>('')
  const [emailError, setEmailError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmittedAndSuccessful, setIsSubmittedAndSuccessful] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFirstNameError('');
    setEmailError('');
    setIsSubmittedAndSuccessful(false);

    let isValid: boolean = true;

    if (firstName.trim() === '') {
      setFirstNameError('This field is required');
      isValid = false;
    }

    if (email.trim() === '') {
      setEmailError('This field is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1500));

      setFirstName('');
      setEmail('');
      setIsLoading(false);
      setIsSubmittedAndSuccessful(true);

      /* Vercel analytics */
      const hashedEmail = await sha256(email.toLowerCase()); // Hash email (lowercase for consistency)
      const hashedFirstName = await sha256(firstName.toLowerCase());

      track('Newsletter_Subscribed', {
        email: hashedEmail,
        first_name: hashedFirstName,
      });
    }
  };

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
    setFirstNameError('');
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  return (
    <div className={containerStyles}>
      {isSubmittedAndSuccessful ? (
        <div className="font-bold text-center w-full text-white text-lg">
          Subscribed. Thank you.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full">
          <div className="md:flex md:items-start md:space-x-4">
            {/* First Name Field */}
            <div className="mb-4 flex-1 md:mb-0 focus-within:text-white transition-colors duration-200">
              <label htmlFor="first_name" className="mb-2 block text-left text-sm font-medium text-gray-700">First Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-5 w-5 text-gray-200" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  disabled={isLoading}
                  className={`${baseInputFieldStyles} ${firstNameError ? 'border-[rgb(255_0_0_/_0.5)]' : 'border-[rgb(255_255_255_/_0.09)]'}`}
                  placeholder="John"
                  value={firstName}
                  onChange={handleFirstNameChange}
                />
              </div>
              <div className="min-h-[1.5rem] mt-1">
                {firstNameError && (
                  <p className="text-sm bg-white text-black p-1 px-2 rounded-[5px] w-fit">
                    {firstNameError}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="mb-4 flex-1 md:mb-0 focus-within:text-white transition-colors duration-200">
              <label htmlFor="email" className="mb-2 block text-left text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-200" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  disabled={isLoading}
                  className={`${baseInputFieldStyles} ${emailError ? 'border-[rgb(255_0_0_/_0.5)]' : 'border-[rgb(255_255_255_/_0.09)]'}`}
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>
              <div className="min-h-[1.5rem] mt-1">
                {emailError && (
                  <p className="text-sm bg-white text-black p-1 px-2 rounded-[5px] w-fit">
                    {emailError}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 md:mt-[1.875rem]">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-[rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 md:w-auto min-w-28
                  ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent border-solid rounded-full animate-spin-fast"></div>
                  </div>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

export default Newsletter