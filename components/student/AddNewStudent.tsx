"use client";
import React, { useState, FormEvent, useRef, useEffect } from "react";
import { useStudentData } from "./useStudentData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  checkRollNumberExists,
  createStudent,
  uploadStudentImage,
} from "@/server/server";
import toast from "react-hot-toast";

// Define the shape of the form data to ensure type safety with TypeScript
interface ParentData {
  fatherName: string;
  motherName: string;
  parentContact: string;
  occupation: string;
  email: string;
}
interface Kit {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ImageData {
  url: string;
  public_id: string;
}

interface StudentFormData {
  rollNo: string;
  name: string;
  className: string;
  previousSchoolName: string;
  medium: string;
  DOB: string; // Storing as string to match input type="date"
  gender: string;
  category: string;
  state: string;
  city: string;
  pinCode: string;
  permanentAddress: string;
  tShirtSize: string;
  mobileNumber: string;
  howDidYouHearAboutUs: string;
  programmeName: string;
  emergencyContact: string;
  email: string;
  batch: string;
  phone: string;
  image: ImageData;
  parent: ParentData;
  kit: string; // We'll handle this as a comma-separated string in the form
}

// Initial state for the form
const initialFormData: StudentFormData = {
  rollNo: "",
  name: "",
  className: "",
  previousSchoolName: "",
  medium: "",
  DOB: "",
  gender: "",
  category: "",
  state: "",
  city: "",
  pinCode: "",
  permanentAddress: "",
  tShirtSize: "",
  mobileNumber: "",
  howDidYouHearAboutUs: "",
  programmeName: "",
  emergencyContact: "",
  email: "",
  batch: "",
  phone: "",
  image: {
    url: "",
    public_id: "",
  },
  parent: {
    fatherName: "",
    motherName: "",
    parentContact: "",
    occupation: "",
    email: "",
  },
  kit: "",
};

// Main App component
const AddNewStudent = () => {
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const rollNumberTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [suggestedRollNumbers, setSuggestedRollNumbers] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showOtherSource, setShowOtherSource] = useState<boolean>(false);
  const [otherSourceText, setOtherSourceText] = useState<string>("");
  const [formReset, setFormReset] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  const {
    kits,
    batches,
  } = useStudentData();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (rollNumberTimeoutRef.current) {
        clearTimeout(rollNumberTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle nested state for parent and image fields
    if (name.startsWith("parent.")) {
      const parentField = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        parent: {
          ...prevData.parent,
          [parentField]: value,
        },
      }));
    } else if (name.startsWith("image.")) {
      const imageField = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        image: {
          ...prevData.image,
          [imageField]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleKitChage = (value: string, status: boolean) => {
    if (formData.kit === "") {
      formData.kit = value;
    } else {
      const selectedKits = formData.kit.split(",");
      if (status) {
        formData.kit = `${formData.kit},${value}`;
      } else {
        formData.kit = selectedKits.filter((kit) => kit !== value).join(",");
      }
    }
    // console.log(formData.kit);
  };

  const handleCheckRollNumbers = () => {
    if (formData.rollNo) {
      checkRollNumberExists(formData.rollNo)
        .then((res) => {
          setSuggestedRollNumbers(res.rollNumbers);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Unable to check roll number");
        });
    }
  };

  // Specialized handler for roll number input with auto-check functionality
  const handleRollNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Update the form data
    setFormData((prevData) => ({
      ...prevData,
      rollNo: value,
    }));

    // Clear any existing timeout
    if (rollNumberTimeoutRef.current) {
      clearTimeout(rollNumberTimeoutRef.current);
    }

    // If the roll number has at least 4 characters, check it after a short delay
    if (value.length >= 4) {
      rollNumberTimeoutRef.current = setTimeout(() => {
        checkRollNumberExists(value)
          .then((res) => {
            setSuggestedRollNumbers(res.rollNumbers);
          })
          .catch((err) => {
            console.log(err);
            toast.error("Unable to check roll number");
          });
      }, 500); // 500ms delay to avoid too many API calls
    } else {
      // Clear suggestions if roll number is less than 4 characters
      setSuggestedRollNumbers([]);
    }
  };

  // Handler for "How did you hear about us?" dropdown
  const handleSourceChange = (value: string) => {
    if (value === "Others") {
      setShowOtherSource(true);
      setFormData((prevData) => ({
        ...prevData,
        howDidYouHearAboutUs: "",
      }));
    } else {
      setShowOtherSource(false);
      setOtherSourceText("");
      setFormData((prevData) => ({
        ...prevData,
        howDidYouHearAboutUs: value,
      }));
    }
  };

  // Handler for "Others" text input
  const handleOtherSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setOtherSourceText(value);
    setFormData((prevData) => ({
      ...prevData,
      howDidYouHearAboutUs: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await uploadStudentImage(formData);
        if (res && res.image) {
          //  setUploadedImage(res.image);
          setFormData((prevData) => ({
            ...prevData,
            image: res.image,
          }));
          // console.log(res);

          toast.success("Image uploaded successfully");
        } else {
          //  setUploadedImage(null);
          toast.error("Image upload failed");
        }
      } catch (err) {
        //  setUploadedImage(null);
        toast.error("Image upload failed");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const validateForm = () => {
    const {
      name,
      mobileNumber,
      batch,
      emergencyContact,
      image,
      parent,
      gender,
    } = formData;
    let isValid = true;

    // Check required fields from the backend logic
    if (!name.trim() || !batch.trim() || !mobileNumber.trim()) {
      toast.error("Name, Batch, and Mobile number are required.");
      isValid = false;
    }

    // Check parent and emergency contact if parent info is provided
    if (parent.parentContact.trim() || emergencyContact.trim()) {
      if (!parent.parentContact.trim() || !emergencyContact.trim()) {
        toast.error("Both Parent Contact and Emergency Contact are required if any parent details are provided.");
        isValid = false;
      }
    }

    // Check for a valid image URL
    // if (!image.url.trim()) {
    //   toast.error("An Image URL is required.");
    //   isValid = false;
    // }

    // Basic mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    if (mobileNumber.trim() && !mobileRegex.test(mobileNumber.trim())) {
      toast.error("Please enter a valid 10-digit mobile number.");
      isValid = false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // return;
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Prepare the data for the API call, converting the kit string to an array
    const submissionData = {
      ...formData,
      kit: formData.kit
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0),
      phone: formData.mobileNumber, // The backend uses `mobileNumber` for `phone` as well
    };

    console.log("Submitting data:", submissionData);

    // Call the API to create a student
    createStudent(submissionData)
      .then((res) => {
        toast.success(res.message || "Successfully created student");
        
        // Reset form after successful creation - create a fresh copy to ensure complete reset
        setFormData({...initialFormData});
        
        // Reset additional state variables
        setShowOtherSource(false);
        setOtherSourceText("");
        
        // Reset file input by clearing the form
        if (formRef.current) {
          formRef.current.reset();
          
          // Uncheck all kit checkboxes
          const checkboxes = formRef.current.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach((checkbox) => {
            (checkbox as HTMLInputElement).checked = false;
          });
        }
        
        // Clear any suggested roll numbers
        setSuggestedRollNumbers([]);
        
        // Show a success message
        toast.success("Student created successfully! Form has been reset.");
        
        // Scroll to top of form with animation
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Add brief highlight effect to indicate form reset
        setFormReset(true);
        setTimeout(() => {
          setFormReset(false);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response?.data?.error || "Failed to create student");
      })
      .finally(() => {
        setIsLoading(false);
      });
    // Example:
    // fetch('/api/createStudent', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(submissionData),
    // })
    // .then(response => response.json())
    // .then(data => {
    //   if (data.error) {
    //     setMessage({ type: 'error', text: data.error });
    //   } else {
    //     setMessage({ type: 'success', text: data.message });
    //     setFormData(initialFormData); // Clear form on success
    //   }
    // })
    // .catch(error => {
    //   console.error('API error:', error);
    //   setMessage({ type: 'error', text: 'Failed to create student. Please try again.' });
    // })
    // .finally(() => {
    //   setIsLoading(false);
    // });

    // Mock API call for demonstration
    // setTimeout(() => {
    //   setIsLoading(false);
    //   setMessage({
    //     type: "success",
    //     text: "Student created successfully! (This is a mock response)",
    //   });
    //   setFormData(initialFormData); // Clear form on success
    //   if (formRef.current) {
    //     formRef.current.reset(); // Reset form inputs
    //   }
    // }, 2000);
  };

  // Style classes - improved for better UI
  const commonInputClasses =
    "mt-1 text-start block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200 ease-in-out p-2.5 bg-white hover:border-indigo-400 outline-none";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
  const requiredLabelClasses =
    "after:content-['*'] after:ml-0.5 after:text-red-500";
  const fieldsetClasses = 
    "p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow duration-300";
  const sectionHeaderClasses = 
    "text-xl font-semibold mb-5 text-gray-800 border-b pb-2 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center font-[Inter]">
      <style dangerouslySetInnerHTML={{
        __html: `
          input, select, textarea {
            border: 1px solid #d1d5db !important;
          }
          input:focus, select:focus, textarea:focus {
            border-color: #6366f1 !important;
            box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2) !important;
          }
        `
      }} />
      <div className="w-full max-w-5xl bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-indigo-50 p-2 rounded-xl">
            <h1 className="text-3xl font-extrabold text-center text-indigo-700 px-4">
              Create New Student
            </h1>
          </div>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className={`space-y-6 ${formReset ? 'animate-pulse bg-green-50 transition-all duration-700' : ''}`} 
          ref={formRef}>
          {/* Section: Student Information */}
          <fieldset className={fieldsetClasses}>
            <legend className={sectionHeaderClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
              </svg>
              Student Information
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label
                  htmlFor="name"
                  className={`${labelClasses} ${requiredLabelClasses}`}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${commonInputClasses} border-gray-300`}
                  placeholder="Student's full name"
                  required
                />
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <div className="flex flex-col">
                  <label htmlFor="rollNo" className={labelClasses}>
                    Roll Number
                  </label>
                  <input
                    type="text"
                    id="rollNo"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleRollNoChange}
                    placeholder="Enter roll number (auto-check after 4 digits)"
                    className={commonInputClasses}
                  />
                  {suggestedRollNumbers && suggestedRollNumbers.length > 0 && (
                    <div className="mt-2 p-2 border border-indigo-100 rounded-lg bg-indigo-50">
                      <p className="text-sm font-medium text-indigo-700 mb-1">Roll number exists already, <br />Suggested Roll Numbers:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedRollNumbers.map((rollNo, index) => (
                          <span
                            key={index}
                            className="cursor-pointer px-2 py-1 bg-white border border-indigo-300 rounded-md text-indigo-700 hover:bg-indigo-100 hover:border-indigo-500 transition-colors text-sm"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                rollNo: rollNo,
                              });
                            }}
                          >
                            {rollNo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label
                  htmlFor="batch"
                  className={`${labelClasses} ${requiredLabelClasses}`}
                >
                  Batch
                </label>
                <div>
                  {batches.length > 0 ? (
                    <div className="relative">
                      <select
                        id="batch"
                        name="batch"
                        value={formData.batch}
                        onChange={handleChange}
                        className={`${commonInputClasses} appearance-none pr-8 border-gray-300`}
                        required
                      >
                        <option value="">Select Batch</option>
                        {batches.map((batch) => (
                          <option key={batch._id} value={batch.name}>
                            {batch.name}
                          </option>
                        )).sort((a, b) => a.props.children.localeCompare(b.props.children))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                      Please create a batch first
                    </div>
                  )}
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="className" className={labelClasses}>
                  Class Name
                </label>
                <Select 
                  value={formData.className} 
                  onValueChange={(value) => setFormData({...formData, className: value})}
                >
                  <SelectTrigger className="text-md font-medium">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11th">11th</SelectItem>
                    <SelectItem value="12th">12th</SelectItem>
                    <SelectItem value="Dropper">Dropper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label
                  htmlFor="mobileNumber"
                  className={`${labelClasses} ${requiredLabelClasses}`}
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    className={`${commonInputClasses} pl-10 border-gray-300`}
                    required
                  />
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="email" className={labelClasses}>
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    className={`${commonInputClasses} pl-10 border-gray-300`}
                  />
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="DOB" className={labelClasses}>
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    id="DOB"
                    name="DOB"
                    value={formData.DOB}
                    onChange={handleChange}
                    className={`${commonInputClasses} pl-10 border-gray-300`}
                  />
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="gender" className={labelClasses}>
                  Gender
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                    </svg>
                  </div>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`${commonInputClasses} pl-10 border-gray-300 appearance-none`}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 rounded-lg">
                <label htmlFor="category" className={labelClasses}>
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.479m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </div>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`${commonInputClasses} pl-10 border-gray-300 appearance-none`}
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="tShirtSize" className={labelClasses}>
                  T-Shirt Size
                </label>
                <select
                  id="tShirtSize"
                  name="tShirtSize"
                  value={formData.tShirtSize}
                  onChange={handleChange}
                  className={commonInputClasses}
                >
                  <option value="">Select Size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
              <div>
                <label htmlFor="medium" className={labelClasses}>
                  Medium
                </label>
                <Select 
                  value={formData.medium} 
                  onValueChange={(value) => setFormData({...formData, medium: value})}
                >
                  <SelectTrigger className="text-md font-medium">
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="programmeName" className={labelClasses}>
                  Programme Name
                </label>
                <input
                  type="text"
                  id="programmeName"
                  name="programmeName"
                  value={formData.programmeName}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="howDidYouHearAboutUs" className={labelClasses}>
                  How did you hear about us?
                </label>
                <div className="space-y-3">
                  <Select 
                    value={showOtherSource ? "Others" : formData.howDidYouHearAboutUs} 
                    onValueChange={handleSourceChange}
                  >
                    <SelectTrigger className="text-md font-medium">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                      <SelectItem value="Google Search">Google Search</SelectItem>
                      <SelectItem value="Friend/Referral">Friend/Referral</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {showOtherSource && (
                    <div className="transition-all duration-300 ease-in-out">
                      <input
                        type="text"
                        placeholder="Please specify..."
                        value={otherSourceText}
                        onChange={handleOtherSourceChange}
                        className={`${commonInputClasses} border-orange-300 focus:border-orange-500 focus:ring-orange-500`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </fieldset>

          {/* Section: Address */}
          <fieldset className={fieldsetClasses}>
            <legend className={sectionHeaderClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Address Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="permanentAddress" className={labelClasses}>
                  Permanent Address
                </label>
                <textarea
                  id="permanentAddress"
                  name="permanentAddress"
                  rows={3}
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  placeholder="Enter full address"
                  className={`${commonInputClasses} resize-none border-gray-300`}
                />
              </div>
              <div>
                <label htmlFor="city" className={labelClasses}>
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="state" className={labelClasses}>
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="pinCode" className={labelClasses}>
                  Pin Code
                </label>
                <input
                  type="text"
                  id="pinCode"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
            </div>
          </fieldset>

          {/* Section: Parent Details */}
          <fieldset className={fieldsetClasses}>
            <legend className={sectionHeaderClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.479m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              Parent Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="parent.fatherName" className={labelClasses}>
                  Father's Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="parent.fatherName"
                    name="parent.fatherName"
                    value={formData.parent.fatherName}
                    onChange={handleChange}
                    placeholder="Father's full name"
                    className={`${commonInputClasses} pl-10`}
                  />
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="parent.motherName" className={labelClasses}>
                  Mother's Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="parent.motherName"
                    name="parent.motherName"
                    value={formData.parent.motherName}
                    onChange={handleChange}
                    placeholder="Mother's full name"
                    className={`${commonInputClasses} pl-10`}
                  />
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="parent.parentContact" className={labelClasses}>
                  Parent's Contact
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="parent.parentContact"
                    name="parent.parentContact"
                    value={formData.parent.parentContact}
                    onChange={handleChange}
                    placeholder="10-digit parent contact number"
                    className={`${commonInputClasses} pl-10`}
                  />
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="emergencyContact" className={labelClasses}>
                  Emergency Contact
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Emergency contact number"
                    className={`${commonInputClasses} pl-10`}
                    required
                  />
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="parent.occupation" className={labelClasses}>
                  Parent's Occupation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="parent.occupation"
                    name="parent.occupation"
                    value={formData.parent.occupation}
                    onChange={handleChange}
                    placeholder="e.g. Doctor, Engineer, Teacher"
                    className={`${commonInputClasses} pl-10`}
                  />
                </div>
              </div>
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="parent.email" className={labelClasses}>
                  Parent's Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="parent.email"
                    name="parent.email"
                    value={formData.parent.email}
                    onChange={handleChange}
                    placeholder="parent@example.com"
                    className={`${commonInputClasses} pl-10`}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          {/* Section: Image & Kit */}
          <fieldset className={fieldsetClasses}>
            <legend className={sectionHeaderClasses}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              Other Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label
                  htmlFor="image.url"
                  className={`${labelClasses}`}
                >
                  Student Photo
                </label>
                <div className="flex items-center gap-2">
                  {formData.image.url && (
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-indigo-200">
                      <img 
                        src={formData.image.url} 
                        alt="Student" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <label 
                      htmlFor="image.url" 
                      className="cursor-pointer flex items-center gap-2 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                      {uploadingImage ? "Uploading..." : "Upload Photo"}
                    </label>
                    <input
                      type="file"
                      id="image.url"
                      name="image.url"
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a clear photo (JPG, PNG)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="transition duration-300 ease-in-out hover:bg-gray-50 p-2 rounded-lg">
                <label htmlFor="kit" className={labelClasses}>
                  Student Kit Items
                </label>
                <div className="border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto bg-white">
                  {kits.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {kits.map((kit, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 border border-gray-100 rounded hover:bg-indigo-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            id={`${kit._id}`}
                            value={kit._id}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            onChange={(e) => {
                              handleKitChage(
                                e.target.value,
                                e.target.checked
                              );
                            }}
                          />
                          <label 
                            htmlFor={`${kit._id}`}
                            className="ml-2 text-sm font-medium text-gray-700 cursor-pointer select-none"
                          >
                            {kit.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-3 text-gray-500">No kits available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select all items that apply to this student
                </p>
              </div>
            </div>
          </fieldset>

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={isLoading || uploadingImage}
              className="group relative px-10 py-3.5 text-lg font-semibold rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white group-hover:text-indigo-100">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                )}
              </span>
              {isLoading ? "Creating Student..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewStudent;
