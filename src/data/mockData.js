// ─── WARDS ───────────────────────────────────────────────────────────────────
export const wards = [
  { ward_no: 11, ward_name: "Orthopaedic",  location: "Block E", total_beds: 20, tel_extensions: "7711" },
  { ward_no: 12, ward_name: "Geriatric",    location: "Block A", total_beds: 25, tel_extensions: "7712" },
  { ward_no: 13, ward_name: "Cardiology",   location: "Block B", total_beds: 18, tel_extensions: "7713" },
  { ward_no: 14, ward_name: "Neurology",    location: "Block C", total_beds: 15, tel_extensions: "7714" },
  { ward_no: 15, ward_name: "General",      location: "Block D", total_beds: 30, tel_extensions: "7715" },
]

// ─── STAFF ────────────────────────────────────────────────────────────────────
export const staff = [
  { staff_no: "S011", first_name: "Moira",    last_name: "Samuel",    address: "49 School Road, Broxburn",         tel_no: "01506-45633",   date_of_birth: "1961-05-30", sex: "Female", nin: "WB123423D", position: "Charge Nurse",  current_salary: 18760.00, salary_scale: "1C", hrs_per_week: 37.5, contract_type: "Permanent",  payment_type: "Weekly",   ward_no: 11 },
  { staff_no: "S098", first_name: "Carol",    last_name: "Cummings",  address: "15 High Street, Edinburgh",        tel_no: "0131-334-5677", date_of_birth: "1975-03-12", sex: "Female", nin: "AB234512C", position: "Staff Nurse",   current_salary: 15200.00, salary_scale: "2A", hrs_per_week: 37.5, contract_type: "Permanent",  payment_type: "Monthly",  ward_no: 11 },
  { staff_no: "S123", first_name: "Morgan",   last_name: "Russell",   address: "23A George Street, Broxburn",     tel_no: "01506-67676",   date_of_birth: "1980-07-22", sex: "Male",   nin: "CD345623B", position: "Nurse",          current_salary: 13500.00, salary_scale: "3B", hrs_per_week: 37.5, contract_type: "Temporary",  payment_type: "Weekly",   ward_no: 11 },
  { staff_no: "S167", first_name: "Robin",    last_name: "Plevin",    address: "7 Glen Terrace, Edinburgh",       tel_no: "0131-339-6123", date_of_birth: "1978-11-05", sex: "Male",   nin: "EF456734A", position: "Staff Nurse",   current_salary: 15800.00, salary_scale: "2B", hrs_per_week: 37.5, contract_type: "Permanent",  payment_type: "Monthly",  ward_no: 11 },
  { staff_no: "S234", first_name: "Amy",      last_name: "O'Donnell", address: "234 Prices Street, Edinburgh",    tel_no: "0131-334-9099", date_of_birth: "1990-02-18", sex: "Female", nin: "GH567845Z", position: "Nurse",          current_salary: 12900.00, salary_scale: "3A", hrs_per_week: 30,   contract_type: "Temporary",  payment_type: "Weekly",   ward_no: 12 },
  { staff_no: "S344", first_name: "Laurence", last_name: "Burns",     address: "1 Apple Drive, Edinburgh",        tel_no: "0131-344-9100", date_of_birth: "1965-09-30", sex: "Male",   nin: "IJ678956Y", position: "Consultant",    current_salary: 45000.00, salary_scale: "C1", hrs_per_week: 40,   contract_type: "Permanent",  payment_type: "Monthly",  ward_no: null },
  { staff_no: "S401", first_name: "Diane",    last_name: "Fletcher",  address: "88 Montrose Ave, Edinburgh",      tel_no: "0131-556-3322", date_of_birth: "1983-06-14", sex: "Female", nin: "KL789067X", position: "Charge Nurse",  current_salary: 19200.00, salary_scale: "1C", hrs_per_week: 37.5, contract_type: "Permanent",  payment_type: "Weekly",   ward_no: 12 },
  { staff_no: "S502", first_name: "George",   last_name: "Hart",      address: "3 Union Terrace, Edinburgh",      tel_no: "0131-667-4411", date_of_birth: "1972-12-01", sex: "Male",   nin: "MN890178W", position: "Doctor",         current_salary: 38000.00, salary_scale: "D2", hrs_per_week: 40,   contract_type: "Permanent",  payment_type: "Monthly",  ward_no: 13 },
]

// ─── STAFF QUALIFICATIONS ─────────────────────────────────────────────────────
export const staffQualifications = [
  { qual_id: 1, staff_no: "S011", qual_type: "BSc Nursing Studies", qual_date: "1987-07-12", institution: "Edinburgh University" },
  { qual_id: 2, staff_no: "S011", qual_type: "RCN Diploma",          qual_date: "1990-03-01", institution: "Royal College of Nursing" },
  { qual_id: 3, staff_no: "S098", qual_type: "RGN",                  qual_date: "1999-06-01", institution: "Napier University" },
  { qual_id: 4, staff_no: "S344", qual_type: "MBChB",                qual_date: "1990-07-15", institution: "University of Edinburgh" },
  { qual_id: 5, staff_no: "S344", qual_type: "FRCS",                 qual_date: "1996-09-20", institution: "Royal College of Surgeons" },
  { qual_id: 6, staff_no: "S502", qual_type: "MBChB",                qual_date: "1997-07-10", institution: "University of Glasgow" },
]

// ─── STAFF EXPERIENCE ─────────────────────────────────────────────────────────
export const staffExperience = [
  { exp_id: 1, staff_no: "S011", start_date: "1990-01-23", finish_date: "1993-05-01", position: "Staff Nurse",      organization: "Western Hospital" },
  { exp_id: 2, staff_no: "S011", start_date: "1993-06-01", finish_date: "1997-08-31", position: "Senior Nurse",     organization: "Royal Infirmary" },
  { exp_id: 3, staff_no: "S098", start_date: "2000-03-01", finish_date: "2003-08-15", position: "Junior Nurse",     organization: "Royal Infirmary" },
  { exp_id: 4, staff_no: "S344", start_date: "1992-01-01", finish_date: "2000-12-31", position: "Registrar",        organization: "Edinburgh Royal" },
  { exp_id: 5, staff_no: "S502", start_date: "1998-08-01", finish_date: "2004-07-31", position: "Junior Doctor",    organization: "Glasgow General" },
]

// ─── STAFF ROTA ───────────────────────────────────────────────────────────────
export const staffRota = [
  { rota_id: 1, staff_no: "S098", ward_no: 11, week_beginning: "1996-01-09", shift_type: "Late" },
  { rota_id: 2, staff_no: "S123", ward_no: 11, week_beginning: "1996-01-09", shift_type: "Late" },
  { rota_id: 3, staff_no: "S167", ward_no: 11, week_beginning: "1996-01-09", shift_type: "Early" },
  { rota_id: 4, staff_no: "S234", ward_no: 11, week_beginning: "1996-01-09", shift_type: "Night" },
  { rota_id: 5, staff_no: "S344", ward_no: 11, week_beginning: "1996-01-09", shift_type: "Early" },
  { rota_id: 6, staff_no: "S401", ward_no: 12, week_beginning: "1996-01-09", shift_type: "Early" },
  { rota_id: 7, staff_no: "S234", ward_no: 12, week_beginning: "1996-01-09", shift_type: "Night" },
]

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
export const patients = [
  { patient_no: 10234, first_name: "Anne",    last_name: "Phelps",    address: "44 North Briges, Cannonmills, Edinburgh EH1 5GH", tel_no: "0131-332-4111", date_of_birth: "1933-12-12", sex: "Female", marital_status: "Single",  date_registered: "1995-02-21" },
  { patient_no: 10034, first_name: "Ronald",  last_name: "MacDonald", address: "12 Baker Street, Edinburgh EH2 1AB",              tel_no: "0131-445-2233", date_of_birth: "1940-06-15", sex: "Male",   marital_status: "Married", date_registered: "1995-11-10" },
  { patient_no: 10451, first_name: "Robber",  last_name: "Drumtree",  address: "5 Elm Grove, Edinburgh EH9 2JT",                  tel_no: "0131-556-7788", date_of_birth: "1950-03-22", sex: "Male",   marital_status: "Widowed", date_registered: "1996-01-02" },
  { patient_no: 10480, first_name: "Steven",  last_name: "Parks",     address: "89 Castle Road, Edinburgh EH1 2NG",               tel_no: "0131-667-8899", date_of_birth: "1958-09-10", sex: "Male",   marital_status: "Married", date_registered: "1996-01-05" },
  { patient_no: 10563, first_name: "David",   last_name: "Black",     address: "33 Maple Ave, Edinburgh EH4 6RQ",                 tel_no: "0131-778-9900", date_of_birth: "1945-12-01", sex: "Male",   marital_status: "Single",  date_registered: "1996-01-08" },
  { patient_no: 10604, first_name: "Ian",     last_name: "Thompson",  address: "17 Oak Lane, Edinburgh EH7 4PL",                  tel_no: "0131-889-0011", date_of_birth: "1952-07-30", sex: "Male",   marital_status: "Married", date_registered: "1996-01-10" },
]

// ─── NEXT OF KIN ──────────────────────────────────────────────────────────────
export const nextOfKin = [
  { kin_id: 1, patient_no: 10234, full_name: "James Phelps",    relationship: "Father",   address: "145 Rowlands Street, Paisley PA2 5FE", tel_no: "0141-848-2211" },
  { kin_id: 2, patient_no: 10034, full_name: "Susan MacDonald", relationship: "Wife",     address: "12 Baker Street, Edinburgh EH2 1AB",   tel_no: "0131-445-2233" },
  { kin_id: 3, patient_no: 10451, full_name: "Claire Drumtree", relationship: "Daughter", address: "22 Fir Lane, Glasgow G1 3AB",           tel_no: "0141-334-5566" },
  { kin_id: 4, patient_no: 10480, full_name: "Helen Parks",     relationship: "Wife",     address: "89 Castle Road, Edinburgh EH1 2NG",    tel_no: "0131-667-8899" },
]

// ─── LOCAL DOCTORS ────────────────────────────────────────────────────────────
export const localDoctors = [
  { clinic_no: "C001", full_name: "Dr. Helen Pearson",    address: "22 Cannongate Way, Edinburgh EH1 6TY",  tel_no: "0131-332-0012" },
  { clinic_no: "C002", full_name: "Dr. James McAllister", address: "14 Princes Street, Edinburgh EH2 2AB",  tel_no: "0131-445-1122" },
  { clinic_no: "C003", full_name: "Dr. Sarah Webb",       address: "5 Queen Street, Edinburgh EH2 1JQ",     tel_no: "0131-556-3344" },
]

// ─── PATIENT REFERRALS ────────────────────────────────────────────────────────
export const patientReferrals = [
  { referral_id: 1, patient_no: 10234, clinic_no: "C001" },
  { referral_id: 2, patient_no: 10034, clinic_no: "C001" },
  { referral_id: 3, patient_no: 10451, clinic_no: "C002" },
  { referral_id: 4, patient_no: 10480, clinic_no: "C003" },
]

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
export const appointments = [
  { appointment_no: 1001, patient_no: 10234, consultant_staff_no: "S344", appt_date: "1995-02-21", appt_time: "10:00", exam_room: "E252", outcome: "Waiting list" },
  { appointment_no: 1002, patient_no: 10034, consultant_staff_no: "S344", appt_date: "1995-11-10", appt_time: "14:00", exam_room: "E253", outcome: "Outpatient" },
  { appointment_no: 1003, patient_no: 10451, consultant_staff_no: "S344", appt_date: "1996-01-10", appt_time: "09:30", exam_room: "E252", outcome: "Waiting list" },
  { appointment_no: 1004, patient_no: 10480, consultant_staff_no: "S502", appt_date: "1996-01-11", appt_time: "11:00", exam_room: "E255", outcome: "Waiting list" },
]

// ─── BEDS ─────────────────────────────────────────────────────────────────────
export const beds = [
  { bed_no: 79, ward_no: 11, status: "Occupied"  },
  { bed_no: 80, ward_no: 11, status: "Occupied"  },
  { bed_no: 84, ward_no: 11, status: "Occupied"  },
  { bed_no: 87, ward_no: 11, status: "Occupied"  },
  { bed_no: 85, ward_no: 11, status: "Available" },
  { bed_no: 86, ward_no: 11, status: "Available" },
]

// ─── IN-PATIENTS ──────────────────────────────────────────────────────────────
export const inPatients = [
  { inpatient_id: 1, patient_no: 10451, ward_no: 11, bed_no: 84, waiting_list_date: "1996-01-12", date_placed: "1996-01-12", expected_leave_date: "1996-01-17", actual_leave_date: null,         expected_stay_date: 5  },
  { inpatient_id: 2, patient_no: 10480, ward_no: 11, bed_no: 79, waiting_list_date: "1996-01-12", date_placed: "1996-01-14", expected_leave_date: "1996-01-18", actual_leave_date: null,         expected_stay_date: 4  },
  { inpatient_id: 3, patient_no: 10563, ward_no: 11, bed_no: 80, waiting_list_date: "1996-01-13", date_placed: "1996-01-13", expected_leave_date: "1996-01-27", actual_leave_date: null,         expected_stay_date: 14 },
  { inpatient_id: 4, patient_no: 10604, ward_no: 11, bed_no: 87, waiting_list_date: "1996-01-14", date_placed: "1996-01-15", expected_leave_date: "1996-01-25", actual_leave_date: null,         expected_stay_date: 10 },
  { inpatient_id: 5, patient_no: 10034, ward_no: 12, bed_no: 12, waiting_list_date: "1995-11-10", date_placed: "1995-11-15", expected_leave_date: "1995-12-15", actual_leave_date: "1995-12-14", expected_stay_date: 30 },
]

// ─── OUT-PATIENTS ─────────────────────────────────────────────────────────────
export const outPatients = [
  { outpatient: 1, patient_no: 10034, appt_date: "1996-02-01", appt_time: "09:30" },
  { outpatient: 2, patient_no: 10234, appt_date: "1996-02-10", appt_time: "11:00" },
]

// ─── PHARMACEUTICAL SUPPLIES ──────────────────────────────────────────────────
export const pharmaceuticalSupplies = [
  { drug_no: 10223, drug_name: "Morphine",     description: "Pain killer",  dosage: "10mg/ml",  admin_method: "Oral", qty_in_stock: 200, reorder_level: 50,  cost_per_unit: 27.75 },
  { drug_no: 10334, drug_name: "Tetracycline", description: "Antibiotic",   dosage: "0.5mg/ml", admin_method: "IV",   qty_in_stock: 28,  reorder_level: 30,  cost_per_unit: 12.50 },
  { drug_no: 10445, drug_name: "Aspirin",      description: "Pain reliever",dosage: "500mg",    admin_method: "Oral", qty_in_stock: 500, reorder_level: 100, cost_per_unit: 2.30  },
  { drug_no: 10556, drug_name: "Penicillin",   description: "Antibiotic",   dosage: "250mg",    admin_method: "IV",   qty_in_stock: 22,  reorder_level: 25,  cost_per_unit: 18.90 },
]

// ─── PATIENT MEDICATION ───────────────────────────────────────────────────────
export const patientMedications = [
  { medication_id: 1, patient_no: 10034, drug_no: 10223, units_per_day: 50, admin_method: "Oral", start_date: "1996-03-24", finish_date: "1996-04-24" },
  { medication_id: 2, patient_no: 10034, drug_no: 10334, units_per_day: 10, admin_method: "IV",   start_date: "1996-03-24", finish_date: "1996-04-17" },
  { medication_id: 3, patient_no: 10034, drug_no: 10223, units_per_day: 10, admin_method: "Oral", start_date: "1996-04-25", finish_date: "1996-05-02" },
  { medication_id: 4, patient_no: 10451, drug_no: 10445, units_per_day: 3,  admin_method: "Oral", start_date: "1996-01-12", finish_date: "1996-01-17" },
  { medication_id: 5, patient_no: 10563, drug_no: 10556, units_per_day: 2,  admin_method: "IV",   start_date: "1996-01-13", finish_date: "1996-01-27" },
]

// ─── SURGICAL SUPPLIES ────────────────────────────────────────────────────────
export const surgicalSupplies = [
  { item_no: 2001, item_name: "Syringe 5ml",     description: "Disposable plastic syringe", qty_in_stock: 1000, reorder_level: 200, cost_per_unit: 0.45 },
  { item_no: 2002, item_name: "Sterile Dressing", description: "Sterile wound dressing",    qty_in_stock: 500,  reorder_level: 100, cost_per_unit: 1.20 },
  { item_no: 2003, item_name: "Plastic Apron",    description: "Disposable plastic apron",  qty_in_stock: 2000, reorder_level: 400, cost_per_unit: 0.15 },
  { item_no: 2004, item_name: "Latex Gloves",     description: "Disposable latex gloves",   qty_in_stock: 180,  reorder_level: 500, cost_per_unit: 0.30 },
]

// ─── SUPPLIERS ────────────────────────────────────────────────────────────────
export const suppliers = [
  { supplier_no: 3001, supplier_name: "MedSupply Ltd",       address: "100 Industrial Way, Glasgow G3 8RT",  tel_no: "0141-555-1234", fax_no: "0141-555-1235" },
  { supplier_no: 3002, supplier_name: "PharmaCo Scotland",   address: "45 Commerce Park, Edinburgh EH6 7LD", tel_no: "0131-666-5678", fax_no: "0131-666-5679" },
  { supplier_no: 3003, supplier_name: "NHS Central Supplies", address: "1 Health Drive, Aberdeen AB10 1FJ",  tel_no: "01224-777-9012",fax_no: "01224-777-9013"},
]

// ─── REQUISITIONS ─────────────────────────────────────────────────────────────
export const requisitions = [
  { requisition_no: 34567712, ward_no: 11, staff_no: "S011", order_date: "1996-02-15", delivered_date: null,         signed_by: "S011" },
  { requisition_no: 34567800, ward_no: 12, staff_no: "S401", order_date: "1996-02-18", delivered_date: "1996-02-20", signed_by: "S401" },
  { requisition_no: 34567900, ward_no: 13, staff_no: "S502", order_date: "1996-02-22", delivered_date: null,         signed_by: "S502" },
]

// ─── REQUISITION ITEMS ────────────────────────────────────────────────────────
export const requisitionItems = [
  { req_item_id: 1, requisition_no: 34567712, item_type: "Pharmaceutical", item_no: null, drug_no: 10223, qty_required: 50,  cost_per_unit: 27.75 },
  { req_item_id: 2, requisition_no: 34567712, item_type: "Surgical",       item_no: 2001, drug_no: null,  qty_required: 100, cost_per_unit: 0.45  },
  { req_item_id: 3, requisition_no: 34567800, item_type: "Surgical",       item_no: 2002, drug_no: null,  qty_required: 200, cost_per_unit: 1.20  },
  { req_item_id: 4, requisition_no: 34567900, item_type: "Pharmaceutical", item_no: null, drug_no: 10334, qty_required: 30,  cost_per_unit: 12.50 },
  { req_item_id: 5, requisition_no: 34567900, item_type: "Surgical",       item_no: 2004, drug_no: null,  qty_required: 500, cost_per_unit: 0.30  },
]
