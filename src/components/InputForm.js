import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Tooltip } from 'bootstrap'; // Make sure to import Tooltip
import './inputform.css';
import BtnLoader from "./BtnLoader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReCAPTCHA from "react-google-recaptcha";


{/* <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script> */}



const InputForm = () => {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  // reCAPTCHA site key (from Google reCAPTCHA Admin Console)
  const RECAPTCHA_SITE_KEY = "6LeNAL0qAAAAAEhvBO3hC2eSbxjwXN8_dUWzUbG1";
  useEffect(() => {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => new Tooltip(tooltipTriggerEl));
  }, []);

  const handleCaptchaVerify = (token) => {
    if (token) {
      setCaptchaVerified(true);
    } else {
      setCaptchaVerified(false);
    }
  };
  const [clients, setClients] = useState([
    {
      name: "",
      age: "",
      gender: "",
      payment_frequency: "Annually",
      relationship: "Main Applicant",
      length:"",
      area_of_coverage: "Worldwide",
      currency: "USD",
      nationality: "Indonesia",
      country_of_residence: "Indonesia",      
      plans: {
        hs: "Essential",  
        hs_deductible: "Nil",
        op: "Essential",
        op_co_ins: "Nil",
        ma: "N/A",
        dn: "Essential",
      },
      isValid: {
        nameValid: true,
        ageValid: true,
        genderValid: true,
        relationshipValid: true
      }
    },
  ]);
  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    contactNumber: "",
    emailAddress: "",
    country_residence: "Indonesia",
    nationality: "",
    area_of_coverage: "Worldwide",
  });
  const [response, setResponse] = useState([]);
  //translate gender
  const translateGender = (gender) => {
    if (gender === "Male") return "Laki-laki";
    if (gender === "Female") return "Perempuan";
    return ""; 
  };
//translate area of coverage
  const areaCoverageTranslation = {
    "Worldwide": "Seluruh Dunia",
    "Worldwide excl USA": "Seluruh Dunia kecuali AS",
    "ASEAN Ex. SG": "ASEAN kec. SG",
  };

  const getFamilyDiscountPercentage = (numDependents) => {
    if (numDependents === 2) {
      return 5;
    } else if (numDependents === 3) {
      return 7.5;
    } else if (numDependents === 4) {
      return 10;
    } else if (numDependents >= 5) {
      return 15; // Max discount for 5 or more dependents
    } else {
      return 0; // No discount for 1 applicant
    }
  };

  const [loadingState, setLoadingState] = useState({
    getRates: false,
    submitApplication: false,
  });
  // Track loading status
  
  const handleClientChange = (index, e) => {
    const { name, value } = e.target;
    const updatedClients = [...clients];
    updatedClients[index][name] = value;
    setClients(updatedClients);
  };

  // mamumula ang field pag d valid ang email
  const [isEmailValid, setIsEmailValid] = useState(true);
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({ ...contactInfo, [name]: value });
    if (name === "emailAddress") {
      setIsEmailValid(validateEmail(value));  // Validate email and update state -- mamumula ang field ng email pag d valid emailaddress ginamit
    }
    if (name === "area_of_coverage") {
      // Update area_of_coverage for all clients when it is changed
      const updatedClients = clients.map((client) => ({
        ...client,
        area_of_coverage: value, // Ensure all clients have the updated area of coverage
      }));
      setClients(updatedClients);
    }
  };

  const handlePlanChange = (index, type, value) => {
    const updatedClients = [...clients];
    updatedClients[index].plans[type] = value;
    setClients(updatedClients);
  };
  // limit the number of clients
  const CLIENT_LIMIT = 10;

  const addClient = () => {
    const newClient = {
        name: "",
        age: "",
        gender: "",
        payment_frequency: "Annually",
        relationship: "Dependent",
        length: "",
        area_of_coverage: contactInfo.area_of_coverage,
        currency: "USD",
        nationality: "Indonesia",
        country_of_residence: "Indonesia",
        plans: {
            hs: "Essential",
            hs_deductible: "Nil",
            op: "Essential",
            op_co_ins: "Nil",
            ma: "N/A",
            dn: "Essential",
        },
        isValid: {
            nameValid: true,
            ageValid: true,
            genderValid: true,
            relationshipValid: true
        }
    };
    setClients([...clients, newClient]);
};


  const removeClient = (index) => {
    setClients((prevClients) => prevClients.filter((_, i) => i !== index));
    setResponse((prevResponse) => prevResponse.filter((_, i) => i !== index));
  };


// Handle form submission for Submit Application color green and red
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitMessageType, setSubmitMessageType] = useState(''); // 'success' or 'error'

  const displayMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);  // This determines where the message will be shown
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };
  const [showMessage, setShowMessage] = useState(false);

// validate email if correct dont send email if the type is not correct
  const validateEmail = (email) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };
 
  // track the validity of the form (if empty make the input red)// --------------------------eto ung para sa mag rered ang field pag blank sa form----------------
  const [isValid, setIsValid] = useState({
    fullNameValid: true,
    contactNumberValid: true,
    nationalityValid: true,
    emailAddressValid: true,
    clientNameValid: true,
    clientAgeValid: true,
    clientGenderValid: true
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
// --------------------------eto ung para sa mag rered ang field pag blank sa form----------------
let formIsValid = true;

      // Validate contact information
      const isFullNameValid = contactInfo.fullName.trim() !== '';
      const isContactNumberValid = contactInfo.contactNumber.trim() !== '';
      const isNationalityValid = contactInfo.nationality.trim() !== '';
      const isEmailAddressValid = validateEmail(contactInfo.emailAddress);
  
      // Update state for contact info validation
      setIsValid(prevState => ({
          ...prevState,
          fullNameValid: isFullNameValid,
          contactNumberValid: isContactNumberValid,
          nationalityValid: isNationalityValid,
          emailAddressValid: isEmailAddressValid
      }));
  
      // Validate each client and update their validation state
      const updatedClients = clients.map(client => ({
          ...client,
          isValid: {
              nameValid: client.name.trim() !== '',
              ageValid: client.age.trim() !== '',
              genderValid: client.gender !== '' && client.gender !== 'Select',
              relationshipValid: client.relationship !== '' && client.relationship !== 'Select'
          }
      }));
  
      const allClientsValid = updatedClients.every(client =>
          Object.values(client.isValid).every(Boolean)
      );
  
      setClients(updatedClients);
  
      // Prevent form submission if any validation fails
      if (!isFullNameValid || !isContactNumberValid || !isNationalityValid || !isEmailAddressValid || !allClientsValid) {
          displayMessage("Please fill out all required fields correctly.", "getRates");
          return;
      }
  
      setLoadingState(prev => ({ ...prev, getRates: true }));
  

// --------------------------eto ung para sa mag rered ang field pag blank sa form nasa taas neto ----------------


 // Check if contact information is filled
 if (!contactInfo.fullName || !contactInfo.contactNumber || !validateEmail(contactInfo.emailAddress) || !contactInfo.nationality) {
  displayMessage("Please fill out all required fields.", "getRates");
  return; // Don't proceed if contact info is missing
}

// Check if policy information (clients' details) is filled
const missingPolicyInfo = clients.some((client) => 
  !client.name || !client.age || !client.gender || !client.relationship
);

if (missingPolicyInfo) {
  displayMessage("Please fill out all required fields.", "getRates");
  return; // Don't proceed if policy info is missing
}
setLoadingState((prev) => ({ ...prev, getRates: true })); // Start loading for Get Rates

    try {
      const token = "your-api-token";
      const apiUrl ="https://mib-quotetool.com/quoting_api/api/quotations/get_rates";

        const body = {
          contactInfo, // Include contact information
          clients,
          deductibles: clients.map((client) => client.plans.hs_deductible),
          specifics: {
            my_health_indonesia: clients.map((client) => ({
              hs: { plan: client.plans.hs, deductible: client.plans.hs_deductible },
              op: { plan: client.plans.op, co_ins: client.plans.op_co_ins },
              ma: { plan: client.plans.ma },
              dn: { plan: client.plans.dn },
            })),
          },
          insurers: ["my_health_indonesia"],
        };
  
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

      const result = await axios.post(apiUrl, body, config);
      setResponse(
        result.data.my_health_indonesia.rates.map((rate) => ({
          ...rate,
          hs: rate.hs ? parseFloat(rate.hs.toFixed(2)) : "N/A",
          op: rate.op ? parseFloat(rate.op.toFixed(2)) : "N/A",
          ma: rate.ma ? parseFloat(rate.ma.toFixed(2)) : "N/A",
          dn: rate.dn ? parseFloat(rate.dn.toFixed(2)) : "N/A",
        }))
      );
      displayMessage("", "getRates");

    } catch (error) {
      console.error("Error fetching API:", error.response || error.message);
      displayMessage("Failed to fetch data. Please check your inputs.", "getRates");

    }finally {
      setLoadingState((prev) => ({ ...prev, getRates: false })); // Stop loading
    }
  };

  const calculateTotalPremium = () => {
    return response
      .reduce((total, rate) => {
        const subtotal = ["hs", "op", "ma", "dn"]
          .map((key) => (rate[key] !== "N/A" && rate[key] !== undefined ? rate[key] : 0))
          .reduce((sum, premium) => sum + premium, 0);
        return total + subtotal;
      }, 0)
      .toFixed(2);
  };

  const handleEmailSubmit = async () => {
      // Check if contact information is filled
      if (!captchaVerified) {
        toast.error("Harap menyelesaikan CAPTCHA terlebih dahulu.");
        return;
      }
  if (!contactInfo.fullName || !contactInfo.contactNumber || !validateEmail(contactInfo.emailAddress) || !contactInfo.nationality) {
    displayMessage("Harap isi semua bidang yang wajib diisi.", "getRates");
    return; // Don't proceed if contact info is missing
  }

  // Check if policy information (clients' details) is filled
  const missingPolicyInfo = clients.some((client) => 
    !client.name || !client.age || !client.gender || !client.relationship
  );

  if (missingPolicyInfo) {
    displayMessage("Harap isi semua bidang yang wajib diisi.", "getRates");

    return; // Don't proceed if policy info is missing
  }
    // Start loading
    setLoadingState((prev) => ({ ...prev, submitApplication: true })); // Start loading for Submit Application
    try {
      const emailPayload = {contactInfo, 
        // email: "calvin@medishure.com", // Your email address to receive the data
        plans: response.map((rate, index) => ({
          client: `${clients[index].name} (${clients[index].gender}, ${clients[index].age})`,
          hospitalSurgeryPlan: clients[index].plans.hs,
          hospitalSurgeryDeductible: clients[index].plans.hs_deductible,
          hospitalSurgery: `Premium: USD ${rate.hs || "N/A"}`,
          outpatientPlan: clients[index].plans.op,
          outpatientDeductible: clients[index].plans.op_co_ins,
          outpatient: `Premium: USD ${rate.op || "N/A"}`,
          maternityPlan: clients[index].plans.ma,
          maternity: `Premium: USD ${rate.ma || "N/A"}`,
          dentalPlan: clients[index].plans.dn,
          dental: `Premium: USD ${rate.dn || "N/A"}`,
          subtotal: `USD ${["hs", "op", "ma", "dn"]
            .map((key) => (rate[key] !== undefined && rate[key] !== "N/A" ? rate[key] : 0))
            .reduce((sum, premium) => sum + premium, 0)
            .toFixed(2)}`,
        })),
        totalPremium: calculateTotalPremium(),
      };
  
      const result = await axios.post(
        "https://bahasa-quotation-tools-backend.vercel.app/send-email", // Updated to deployed backend URL
        emailPayload
      );
      displayMessage("Email berhasil dikirim!", "submitApplication");
      setSubmitMessageType("success");
    } catch (error) {
      console.error("Error sending email:", error);
      displayMessage("Gagal mengirim email.", "submitApplication");
      setSubmitMessageType("error");
    }finally {
      setLoadingState((prev) => ({ ...prev, submitApplication: false })); // Stop loading
    }
    
  };

  return (

    
    <div className="container my-4">
    {/* {showMessage && <p className="alert alert-info">{message}</p>} */}

      <h1 className="text-center mb-2">
        {/* I would like to know more about{" "} */}
        Saya ingin tahu lebih banyak tentang{" "} 
        <span style={{ color: "#151577" }}>MyHealth</span> {/*Family Discount*/} Diskon Keluarga
      </h1>
      <h5 className="text-center mb-2">MyHealth dapat menerima aplikasi dari orang-orang yang berusia 60 tahun atau lebih muda. Untuk mengetahui rencana terbaik dan diskon untuk <br></br>Anda dan keluarga Anda, Anda perlu menyediakan beberapa informasi:</h5>
      <h4 className="text-left mt-4">
        <span style={{ color: "#151577" }}>Rencana</span>
      </h4>
      <div className="responsive-table">
  <table className="table table-bordered table-striped mt-3 text-center plan">     
    <thead>
        <tr>
            <th>Modul</th>
            <th>Inti</th>
            <th>Esensial</th>
            <th>Ekstensif</th>
            <th>Elit</th>
        </tr>
      </thead>      
      <tbody>
        <tr>
          <td>Operasi Rumah Sakit <br></br>
              Batas tahunan per orang per periode asuransi<br></br>
              - Kamar pribadi standar<br></br>
              - Perawatan gigi darurat<br></br>
              - Pemindaian diagnostik dan tes <br></br>
              6 tingkat pemotongan: $0, $500, $1000, $2,500, $5,000 atau $10,000
          </td>
          <td>$300,000</td>
          <td>$1,000,000</td>
          <td>$2,500,000</td>
          <td>$3,000,000</td>
        </tr>
        <tr>
          <td>Rawat Jalan (Opsional)</td>
          <td>$2,000</td>
          <td>$5,000</td>
          <td>Cakupan Penuh</td>
          <td>Cakupan Penuh</td>
        </tr>
        <tr>
          <td>Maternitas (Opsional)</td>
          <td>Tidak Tersedia</td>
          <td>$5,000 per kehamilan</td>
          <td>$8,000 per kehamilan</td>
          <td>$15,000 per kehamilan</td>
        </tr>
        <tr>
          <td>Dental dan Optikal (Opsional)</td>
          <td>.</td>
          <td>..</td>
          <td>...</td>
          <td>....</td>
        </tr>
        <tr>
          <td>Layanan evakuasi, repatriasi, dan bantuan 24/7</td>
          <td>Termasuk hingga $1,000,000</td>
          <td>Termasuk hingga $1,000,000</td>
          <td>Termasuk hingga $1,000,000</td>
          <td>Termasuk hingga $3,000,000</td>
        </tr>
      </tbody>

    </table>
    </div>
      <h4 className="text-left mb-4">
        {" "}
        <span style={{ color: "#151577" }}>Informasi Kontak</span>
      </h4>
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="field_name">Nama Lengkap:</label>
          <input type="text"className={`form-control ${!isValid.fullNameValid && 'invalid-field'}`}name="fullName" value={contactInfo.fullName} onChange={handleContactInfoChange}  required/>
        </div>
        <div className="col-md-2">
          <label className="field_name">Nomor Kontak:</label>
          <input type="text" className={`form-control ${!isValid.contactNumberValid && 'invalid-field'}`} name="contactNumber" value={contactInfo.contactNumber} onChange={handleContactInfoChange}required/>
        </div>
        
        <div className="col-md-3">
          <label className="field_name">Alamat Email:</label>
          <input type="email" className={`form-control ${!isValid.emailAddressValid && 'invalid-field'}`} name="emailAddress" value={contactInfo.emailAddress} onChange={handleContactInfoChange}required/>
        </div>
        <div className="col-md-2">
          <label className="field_name">Negara Tempat Tinggal:</label>
          <select className="form-control" name="country_residence" value={contactInfo.country_residence}>
              <option value="Indonesia">Indonesia</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="field_name">Kewarganegaraan:</label>
          <input type="text"  className={`form-control ${!isValid.nationalityValid && 'invalid-field'}`} name="nationality" value={contactInfo.nationality}onChange={handleContactInfoChange} required/>
        </div>
      </div>
      <h4 className="text-left mb-4">
        {" "}
        <span style={{ color: "#151577" }}>Informasi Polis</span>
      </h4>
      <form onSubmit={handleSubmit}>
        {/* <div className="d-flex justify-content-end mb-2">
          <button type="button"className="btn btn-primary" onClick={addClient}
                disabled={clients.length >= CLIENT_LIMIT} // Disable button if 10 clients are already added (Limit of 10 clients) 
          >
            <i className="fas fa-user-friends"></i> Add Dependent(s)
          </button>
        </div> */}
        {clients.map((client, index) => (
          <div key={index} className="mb-3">
            <div>
              <div className="row">
              <div className="col-md-3">
        <label className="field_name">Nama:</label>
        <input
          type="text"
          className={`form-control ${!client.isValid.nameValid && 'invalid-field'}`}
          name="name"
          value={client.name}
          onChange={(e) => handleClientChange(index, e)}
          required
        />
      </div>
      <div className="col-md-1">
        <label className="field_name">Umur:</label>
        <input
          type="number"
          min="0"
          max="60"
          className={`form-control ${!client.isValid.ageValid && 'invalid-field'}`}
          name="age"
          value={client.age}
          onChange={(e) => handleClientChange(index, e)}
          onInput={(e) => {
            let value = parseInt(e.target.value, 10);
            if (value > 60) e.target.value = 60;
            else if (value < 0) e.target.value = 0;
          }}
          required
        />
      </div>
      <div className="col-md-3">
        <label className="field_name">Jenis Kelamin:</label>
        <select
          className={`form-select dropdown-font ${!client.isValid.genderValid && 'invalid-field'}`}
          name="gender"
          value={client.gender}
          onChange={(e) => handleClientChange(index, e)}
        >
          <option value="">Pilih</option>
          <option value="Male">Laki-laki</option>
          <option value="Female">Perempuan</option>
        </select>
      </div>
                <div className="col-md-3">
                  <label className="field_name">Hubungan:</label>
                  <select className="form-select dropdown-font" name="relationship" value={client.relationship} onChange={(e) => handleClientChange(index, e)}required>
                    <option value="">Pilih</option>
                    <option value="Main Applicant">Pemohon Utama</option>
                    <option value="Dependent">Tanggungan</option>
                  </select>
                </div>
                 {/* Conditionally render the Add Dependent button only for the first client */}
            {index === 0 && (
                <div className="button col-md-1 text-center d-flex align-items-center justify-content-center pt-4 ">
                    <button title="Add Dependent" type="button" className="btn btn-primary" onClick={addClient}style={{borderRadius: '50%', padding :'8px 10px '}} disabled={clients.length >= CLIENT_LIMIT}>
                    <i class="fa-solid fa-user-plus"></i>
                    </button>
                </div>
            )}
        {/* Add Remove Button here */}
        {/* Conditionally render the trash button only if the client is not the Main Applicant */}
        {client.relationship !== "Main Applicant" && (
        <div className="button col-md-1 text-center d-flex align-items-center justify-content-center pt-4 ">
            <button title="Remove Dependent" type="button" className="btn btn-danger"onClick={() => removeClient(index)} style={{borderRadius: '50%',}}>
              <i className="fas fa-trash-alt"></i>
            </button>
          </div> )}
          </div>
    
    </div></div>
        ))}
        <div className="col-md-3">
        <label className="field_name">Area Cakupan:</label>
                <select className="form-select dropdown-font"name="area_of_coverage"value={contactInfo.area_of_coverage}onChange={handleContactInfoChange}>
                           <option value="Worldwide">Seluruh Dunia</option>
                            <option value="Worldwide excl USA">Seluruh Dunia kecuali AS</option>
                            <option value="ASEAN Ex. SG">ASEAN kec. SG</option>
                </select>
                </div>

                <div>
        <h4 className="text-left mt-4">        
          <span style={{ color: "#151577" }}>April (MyHEALTH) Indonesia</span>
        </h4>  
    <div>
    <h5 className="mt-3 col-md-12">Persentase Diskon Keluarga: 
      {" "}<span style={{ color: getFamilyDiscountPercentage(clients.length) > 0 ? 'green' : 'black' }}>
      {getFamilyDiscountPercentage(clients.length)}%
    </span>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      Area Cakupan: {areaCoverageTranslation[contactInfo.area_of_coverage] || contactInfo.area_of_coverage}
      </h5>
  </div>  
  </div>   


{response.length > 0 && (
<div>
    <div className="table-responsive"> 
    <table className="table table-bordered table-striped plan">
    <thead>
        <tr>
          <th>Klien</th>
          <th colSpan={2}>Rumah Sakit & Operasi</th>
          <th colSpan={2}>Rawat Jalan</th>
          <th colSpan={2}>Maternitas</th>
          <th colSpan={2}>Dental</th>
          <th>Subtotal</th>
        </tr>

        <tr>
          <th></th>
          <th><div className="d-flex justify-content-between"><span>Rencana & Kamar</span>
          <span>Pemotongan</span></div></th>
          <th>Premi</th>
          <th><div className="d-flex justify-content-between">
            <span>Rencana & Kamar</span>
          <span>Ko Asuransi.</span></div></th>
          <th>Premi</th>
          <th>Rencana & Kamar</th>
          <th>Premi</th>
          <th>Rencana & Kamar</th>
          <th>Premi</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {response.map((rate, index) => (
          <tr key={index}>
            <td>{`${clients[index].name} (${translateGender(clients[index].gender)}, ${clients[index].age})`}</td>
            <td>
              <div className="d-flex gap-2">
                <select className="form-select dropdown-font" value={clients[index].plans.hs} onChange={(e) => handlePlanChange(index, "hs", e.target.value)}>
                  <option value="Elite">Elit</option>
                  <option value="Extensive">Ekstensif</option>
                  <option value="Essential">Esensial</option>
                  <option value="Core">Inti</option>
                </select>
                <select className="form-select dropdown-font" value={clients[index].plans.hs_deductible} onChange={(e) => handlePlanChange(index, "hs_deductible", e.target.value)}>
                  <option value="Nil">Nil</option>
                  <option value="US$500">US$500</option>
                  <option value="US$1,000">US$1,000</option>
                  <option value="US$2,500">US$2,500</option>
                </select>
              </div>
              {/* Premium: {rate.hs !== "N/A" ? rate.hs.toLocaleString() : "N/A"} */}
            </td>
            <td className="premium">USD {rate.hs !== "N/A" ? rate.hs.toLocaleString() : "N/A"}</td>
            <td>
              <div className="d-flex gap-2">
                <select className="form-select dropdown-font" value={clients[index].plans.op} onChange={(e) => handlePlanChange(index, "op", e.target.value)}>
                  <option value="Elite">Elit</option>
                  <option value="Extensive">Ekstensif</option>
                  <option value="Essential">Esensial</option>
                  <option value="Core">Inti</option>

                </select>
                <select className="form-select dropdown-font" value={clients[index].plans.op_co_ins} onChange={(e) => handlePlanChange(index, "op_co_ins", e.target.value)}>
                  <option value="Nil">Nil</option>
                  <option value="20%">20%</option>
                </select>
              </div>
              {/* Premium: {rate.op !== "N/A" ? rate.op.toLocaleString() : "N/A"} */}
            </td>
            <td className="premium">USD {rate.op !== "N/A" ? rate.op.toLocaleString() : "N/A"}</td>
            <td>
              <select className="form-select dropdown-font" value={clients[index].plans.ma} onChange={(e) => handlePlanChange(index, "ma", e.target.value)}>
                <option value="N/A">Tidak Ada</option>
                <option value="Elite">Elit</option>
                <option value="Extensive">Ekstensif</option>
                <option value="Essential">Esensial</option>
                <option value="Core">Inti</option>

              </select>
              {/* Premium: {rate.ma !== "N/A" ? rate.ma.toLocaleString() : "N/A"} */}
            </td>
            <td className="premium">USD {rate.ma !== "N/A" ? rate.ma.toLocaleString() : "N/A"}</td>
            <td>
              <select className="form-select dropdown-font" value={clients[index].plans.dn} onChange={(e) => handlePlanChange(index, "dn", e.target.value)}>
                <option value="N/A">Tidak Ada</option>
                <option value="Elite">Elit</option>
                <option value="Extensive">Ekstensif</option>
                <option value="Essential">Esensial</option>
                <option value="Core">Inti</option>
              </select>
              {/* Premium: {rate.dn !== "N/A" ? rate.dn.toLocaleString() : "N/A"} */}
            </td>
            <td className="premium">USD {rate.dn !== "N/A" ? rate.dn.toLocaleString() : "N/A"}</td>
            <td className="premium">
              USD{" "}
              {["hs", "op", "ma", "dn"]
                .map((key) =>
                  rate[key] !== undefined && rate[key] !== "N/A" ? rate[key] : 0
                )
                .reduce((sum, premium) => sum + premium, 0).toLocaleString()}
            </td>
          </tr>
        ))}
          <tr>
            <td colSpan="9" className="text-end fw-bold">
              Total Premi Tahunan:
            </td>
            <td className="fw-bold">
              USD {Number(calculateTotalPremium()).toLocaleString()}
            </td>
          </tr>
      </tbody>
    </table>
  </div><br/></div>
)}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px", }}>
  <button onClick={handleSubmit} disabled={loadingState.getRates} className="btn btn-success enhanced-button">
    {loadingState.getRates ? <BtnLoader /> : "Hitung"}
  </button>
  {showMessage && messageType === 'getRates' && <p className="error-message">{message}</p>}
</div>

      </form>
      <p className="text-center mt-4" style={{ fontSize: '12px' }}>
        Dengan mengklik <b>Bicara dengan Penjualan</b> Anda setuju bahwa data Anda dapat digunakan oleh Medishure untuk menghubungi Anda melalui<br></br>telepon atau email terkait aplikasi asuransi Anda. Temukan lebih banyak informasi mengenai pemrosesan data<br></br>Anda di{" "}
        <span style={{ color: "Red", cursor: "pointer" }} data-bs-toggle="modal" data-bs-target="#personalDataPolicyModal">
          Kebijakan Data Pribadi
        </span>.
      </p>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px" }}>
  <ReCAPTCHA
    sitekey={RECAPTCHA_SITE_KEY}
    onChange={handleCaptchaVerify}
  />
  <button
    onClick={handleEmailSubmit}
    disabled={loadingState.submitApplication || !captchaVerified} // Disable button until CAPTCHA is verified
    className="btn btn-success enhanced-button"
  >
    {loadingState.submitApplication ? <BtnLoader /> : "Bicara dengan Penjualan"}
  </button>
  {showMessage && messageType === "submitApplication" && (
    <p className={submitMessageType === "success" ? "success-message" : "error-message"}>
      {message}
    </p>
  )}
</div>


{/* Below the Submit Application button */}
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px" }}>
  <button onClick={handleEmailSubmit} disabled={loadingState.submitApplication} className="btn btn-success enhanced-button">
    {loadingState.submitApplication ? <BtnLoader /> : "Bicara dengan Penjualan"}
  </button>
  {showMessage && messageType === 'submitApplication' &&         <p className={submitMessageType === 'success' ? 'success-message' : 'error-message'}>
  {message}</p>}
</div>
    {/* Place the modal here */}
    <div
      className="modal fade"
      id="personalDataPolicyModal"
      tabIndex="-1"
      aria-labelledby="personalDataPolicyModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="personalDataPolicyModalLabel">
            Kebijakan Data Pribadi</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
          <p>
            <b>Kebijakan Privasi Data Pribadi</b><br/>
            <b>Tanggal Berlaku:</b> 15 Desember 2024<br/>
            <br/>
            <b>1. Pendahuluan<br/></b>
            <span style={{ fontSize: '14px' }}>Selamat datang di alat kutipan April kami. Di Luke Medikal Internasional, kami menghargai dan menghormati privasi Anda. Kebijakan Privasi Data Pribadi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat Anda menggunakan formulir kutipan kami yang tersedia di lukemedikal.co.id.
            Dengan menggunakan formulir kutipan kami, Anda menyetujui ketentuan kebijakan ini.<br/></span>
            <hr/><br/>
            <b>2. Pengumpulan Data</b><br/>
            <span style={{ fontSize: '14px' }}>Ketika Anda mengirimkan permintaan kutipan melalui formulir kami, kami dapat mengumpulkan data Pribadi berikut:<br/>
            &nbsp;• Nama Lengkap<br/>
            &nbsp;• Informasi Kontak (misalnya, alamat email, nomor telepon)<br/>
            &nbsp;• Detail Lokasi<br/>
            &nbsp;• Usia & Jenis Kelamin<br/>
            Kami mengumpulkan informasi ini semata-mata untuk tujuan yang dijelaskan di bawah ini.<br/></span>
            <hr/><br/>
            <b>3. Penggunaan Informasi Anda</b><br/>
            <span style={{ fontSize: '14px' }}>Kami menggunakan informasi pribadi yang dikumpulkan melalui formulir kutipan untuk:<br/>
            &nbsp;&nbsp;• Menyediakan Anda dengan kutipan dan informasi harga yang akurat.<br/>
            &nbsp;&nbsp;• Menghubungi Anda untuk membahas kebutuhan Anda atau memberikan bantuan lebih lanjut.<br/>
            &nbsp;&nbsp;• Meningkatkan layanan dan pengalaman pelanggan kami.<br/>
            &nbsp;&nbsp;• Menjaga catatan internal untuk tujuan administratif.<br/>
            Informasi Anda tidak akan digunakan untuk tujuan pemasaran kecuali Anda memberikan persetujuan eksplisit.<br/></span>
            <hr/><br/>
            <b>4. Penyimpanan dan Perlindungan Informasi Anda</b><br/>
            <span style={{ fontSize: '14px' }}>Kami mengambil langkah teknis dan organisasi yang tepat untuk melindungi data pribadi Anda dari akses, penggunaan, atau pendedahan yang tidak sah. Ini termasuk:<br/>
            &nbsp;&nbsp;• Metode penyimpanan data yang aman.<br/>
            &nbsp;&nbsp;• Akses terbatas ke data pribadi (hanya personel yang berwenang).<br/>
            &nbsp;&nbsp;• Enkripsi dan protokol keamanan untuk melindungi informasi yang ditransmisikan secara online.<br/>
            Kami menyimpan informasi pribadi Anda hanya selama diperlukan untuk memenuhi tujuan pengumpulan atau mematuhi kewajiban hukum.<br/></span>
            <hr/><br/>
            <b>5. Berbagi Informasi Anda</b><br/>
            <span style={{ fontSize: '14px' }}>Kami tidak menjual, menyewakan, atau memperdagangkan informasi pribadi Anda kepada pihak ketiga. Data Anda hanya dapat dibagikan dalam keadaan berikut:<br/>
            &nbsp;&nbsp;• Dengan Persetujuan Anda: Ketika Anda secara eksplisit mengizinkan kami untuk berbagi informasi.<br/>
            &nbsp;&nbsp;• Persyaratan Hukum: Jika diwajibkan oleh hukum, regulasi, atau proses hukum yang sah.<br/>
            &nbsp;&nbsp;• Penyedia Layanan: Pihak ketiga terpercaya yang membantu kami mengoperasikan alat kutipan (mis., layanan email atau hosting).<br/></span>
            <hr/><br/>
            <b>6. Hak Anda</b><br/>
            <span style={{ fontSize: '14px' }}>Berdasarkan undang-undang perlindungan data yang berlaku, Anda memiliki hak untuk:<br/>
            &nbsp;&nbsp;• Mengakses informasi pribadi yang kami simpan tentang Anda.<br/>
            &nbsp;&nbsp;• Memperbaiki ketidakakuratan dalam informasi Anda.<br/>
            &nbsp;&nbsp;• Meminta penghapusan data Anda jika berlaku.<br/>
            &nbsp;&nbsp;• Menolak pengolahan data Anda dalam keadaan tertentu.<br/>
            Untuk menggunakan hak ini atau jika Anda memiliki kekhawatiran terkait privasi, silakan hubungi kami di info@lukemedikal.co.id<br/></span>
            <hr/><br/>
            <b>7. Perubahan Kebijakan Ini</b><br/>
            <span style={{ fontSize: '14px' }}>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mencerminkan perubahan dalam praktik kami atau persyaratan hukum. Versi yang diperbarui akan diposting di halaman ini dengan "Tanggal Efektif".<br/></span>
            <hr/><br/>
            <b>8. Hubungi Kami</b><br/>
            <span style={{ fontSize: '14px' }}>Jika Anda memiliki pertanyaan atau kekhawatiran tentang Kebijakan Privasi ini atau bagaimana data Anda ditangani, silakan hubungi kami:<br/>
            Luke Medikal Internasional<br/>
            <b>Email: info@lukemedikal.co.id<br/>
            Telepon: +62 21 22604632<br/>
            Website: https://lukemedikal.co.id</b></span>
        </p>

      </div>

         
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
export default InputForm;
