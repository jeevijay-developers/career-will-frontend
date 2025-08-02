"use client";
import React, { useState, FormEvent, useRef, useEffect } from "react";
import { MdCheckCircle, MdError, MdInfo, MdClose } from "react-icons/md";
import { useStudentData } from "./useStudentData";
import { stat } from "fs";
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
  const [suggestedRollNumbers, setSuggestedRollNumbers] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const {
    students,
    currentPage,
    totalPages,
    pageSize,
    kits,
    batches,
    batchNames,
    setCurrentPage,
    refreshStudents,
  } = useStudentData();
  // Clear the message after a few seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
      setMessage({
        type: "error",
        text: "Name, Batch, and Mobile number are required.",
      });
      isValid = false;
    }

    // Check parent and emergency contact if parent info is provided
    if (parent.parentContact.trim() || emergencyContact.trim()) {
      if (!parent.parentContact.trim() || !emergencyContact.trim()) {
        setMessage({
          type: "error",
          text: "Both Parent Contact and Emergency Contact are required if any parent details are provided.",
        });
        isValid = false;
      }
    }

    // Check for a valid image URL
    if (!image.url.trim()) {
      setMessage({ type: "error", text: "An Image URL is required." });
      isValid = false;
    }

    // Basic mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    if (mobileNumber.trim() && !mobileRegex.test(mobileNumber.trim())) {
      setMessage({
        type: "error",
        text: "Please enter a valid 10-digit mobile number.",
      });
      isValid = false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
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

    // TODO: Replace this mock API call with your actual fetch request
    createStudent(submissionData)
      .then((res) => {
        toast.success(res.message || "Successfully created student");
      })
      .catch((err) => {
        // console.log(err.response?.data?.erro);
        console.log(err);

        toast.error(err.response?.data?.error || "Failed to create student");
        // toast.error("Failed to create student");
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

  // Function to determine the message box icon
  const getMessageIcon = (type: string) => {
    switch (type) {
      case "success":
        return <MdCheckCircle className="text-green-500 w-6 h-6" />;
      case "error":
        return <MdError className="text-red-500 w-6 h-6" />;
      case "info":
        return <MdInfo className="text-blue-500 w-6 h-6" />;
      default:
        return <MdInfo className="text-gray-500 w-6 h-6" />;
    }
  };

  const commonInputClasses =
    "mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out p-2";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const requiredLabelClasses =
    "after:content-['*'] after:ml-0.5 after:text-red-500";
  const fieldsetClasses = "p-4 border rounded-lg shadow-sm bg-white";

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center font-[Inter]">
      <div className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Create New Student
        </h1>

        {/* Message Box */}
        {message && (
          <div
            className={`flex items-center gap-2 p-4 mb-4 rounded-lg shadow-md border-l-4 ${
              message.type === "success"
                ? "bg-green-50 border-green-400"
                : "bg-red-50 border-red-400"
            }`}
          >
            {getMessageIcon(message.type)}
            <p
              className={`text-sm font-medium ${
                message.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {message.text}
            </p>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" ref={formRef}>
          {/* Section: Student Information */}
          <fieldset className={fieldsetClasses}>
            <legend className="text-xl font-semibold mb-4 text-gray-800">
              Student Information
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
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
                  className={commonInputClasses}
                  required
                />
              </div>
              <div className="flex justify-center flex-row gap-5">
                <div className="w-70">
                  <label htmlFor="rollNo" className={labelClasses}>
                    Roll Number
                  </label>
                  <input
                    type="text"
                    id="rollNo"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    className={commonInputClasses}
                  />
                  <div>
                    {suggestedRollNumbers &&
                      suggestedRollNumbers.length > 0 && (
                        <ul className="list-disc list-inside">
                          <p>Suggested Roll No.</p>
                          {suggestedRollNumbers.map((rollNo, index) => (
                            <li
                              key={index}
                              className="cursor-pointer hover:text-blue-500 text-green-300"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  rollNo: rollNo,
                                });
                              }}
                            >
                              {rollNo}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
                <div className="h-full flex items-center justify-center bg-gray-100 px-2 py-1 rounded-xl">
                  <span
                    className="bg-gray-100 px-2 py-1"
                    title=" Check Roll No. is used or not"
                    onClick={handleCheckRollNumbers}
                  >
                    Check Roll No.
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="batch"
                  className={`${labelClasses} ${requiredLabelClasses}`}
                >
                  Batch
                </label>
                <div>
                  {batches.length > 0 ? (
                    <select
                      id="batch"
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      className={commonInputClasses}
                      required
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch._id} value={batch.name}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div>please create a batch first</div>
                  )}
                </div>
                {/* <input
                  type="text"
                  id="batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  className={commonInputClasses}
                  required
                /> */}
              </div>
              <div>
                <label htmlFor="className" className={labelClasses}>
                  Class Name
                </label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="mobileNumber"
                  className={`${labelClasses} ${requiredLabelClasses}`}
                >
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className={commonInputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="DOB" className={labelClasses}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="DOB"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="gender" className={labelClasses}>
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={commonInputClasses}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className={labelClasses}>
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={commonInputClasses}
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
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
                <input
                  type="text"
                  id="medium"
                  name="medium"
                  value={formData.medium}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
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
                <input
                  type="text"
                  id="howDidYouHearAboutUs"
                  name="howDidYouHearAboutUs"
                  value={formData.howDidYouHearAboutUs}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
            </div>
          </fieldset>

          {/* Section: Address */}
          <fieldset className={fieldsetClasses}>
            <legend className="text-xl font-semibold mb-4 text-gray-800">
              Address Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="permanentAddress" className={labelClasses}>
                  Permanent Address
                </label>
                <textarea
                  id="permanentAddress"
                  name="permanentAddress"
                  rows={3}
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  className={commonInputClasses}
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
            <legend className="text-xl font-semibold mb-4 text-gray-800">
              Parent Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="parent.fatherName" className={labelClasses}>
                  Father's Name
                </label>
                <input
                  type="text"
                  id="parent.fatherName"
                  name="parent.fatherName"
                  value={formData.parent.fatherName}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="parent.motherName" className={labelClasses}>
                  Mother's Name
                </label>
                <input
                  type="text"
                  id="parent.motherName"
                  name="parent.motherName"
                  value={formData.parent.motherName}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="parent.parentContact" className={labelClasses}>
                  Parent's Contact
                </label>
                <input
                  type="tel"
                  id="parent.parentContact"
                  name="parent.parentContact"
                  value={formData.parent.parentContact}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="emergencyContact" className={labelClasses}>
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className={commonInputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="parent.occupation" className={labelClasses}>
                  Parent's Occupation
                </label>
                <input
                  type="text"
                  id="parent.occupation"
                  name="parent.occupation"
                  value={formData.parent.occupation}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
              <div>
                <label htmlFor="parent.email" className={labelClasses}>
                  Parent's Email
                </label>
                <input
                  type="email"
                  id="parent.email"
                  name="parent.email"
                  value={formData.parent.email}
                  onChange={handleChange}
                  className={commonInputClasses}
                />
              </div>
            </div>
          </fieldset>

          {/* Section: Image & Kit */}
          <fieldset className={fieldsetClasses}>
            <legend className="text-xl font-semibold mb-4 text-gray-800">
              Other Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label
                  htmlFor="image.url"
                  className={`${labelClasses} ${requiredLabelClasses}`}
                >
                  Image URL
                </label>
                <input
                  type="file"
                  id="image.url"
                  name="image.url"
                  // value={formData.image.url}
                  onChange={handleImageUpload}
                  className={commonInputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="kit" className={labelClasses}>
                  Kit
                </label>
                <div className="flex justify-center items-center flex-row overflow-auto">
                  {kits.length > 0 ? (
                    kits.map((kit, index) => {
                      return (
                        <div
                          id="kit"
                          key={index}
                          // name="kit"
                          // value={formData.kit}
                          // onChange={handleChange}
                          className={commonInputClasses}
                          // multiple
                        >
                          <div className="flex justify-center items-center gap-3 ">
                            <label htmlFor={`${kit._id}`}>{kit.name}</label>
                            <input
                              type="checkbox"
                              name=""
                              id={`${kit._id}`}
                              value={kit._id}
                              onChange={(e) => {
                                handleKitChage(
                                  e.target.value,
                                  e.target.checked
                                );
                              }}
                            />
                          </div>
                          {/* <option value="">Select a kit</option>
                    {kits.map((kit) => (
                      <option key={kit._id} value={kit._id}>
                        {kit.name}
                      </option>
                    ))} */}
                        </div>
                      );
                    })
                  ) : (
                    <p>No kits available</p>
                  )}
                </div>
                {/* <input
                  type="text"
                  id="kit"
                  name="kit"
                  placeholder="e.g., 60c72b2f9b1e8b0015b6b1a6, 60c72b2f9b1e8b0015b6b1a7"
                  value={formData.kit}
                  onChange={handleChange}
                  className={commonInputClasses}
                /> */}
              </div>
            </div>
          </fieldset>

          {/* Submit Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={isLoading || uploadingImage ? true : false}
              className="px-8 py-3 text-lg font-semibold rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Submitting..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewStudent;
