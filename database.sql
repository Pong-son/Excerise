Database lab_system;
CREATE TABLE users (
  id SERIAL primary key,
  username TEXT,
  email TEXT,
  password TEXT,
  is_admin BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE TABLE order_list (
  id SERIAL primary key,
  supplier_id INT,
  FOREIGN KEY (supplier_id) REFERENCES supplier_list(id),
  order_no INT,
  product TEXT,
  price INT,
  order_confirm_date DATE,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE TABLE supplier_list (
  id SERIAL primary key,
  company_name TEXT,
  type_of_service TEXT,
  contact_person TEXT,
  contact_email TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE TABLE sample_info (
  id SERIAL primary key,
  sample_receive_date TIMESTAMP,
  analysis_date TIMESTAMP,
  batch_no INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE TABLE testing_info (
  id SERIAL primary key,
  sample_info_id INT,
  FOREIGN KEY (sample_info_id) REFERENCES sample_info(id),
  testing_item_id INT,
  FOREIGN KEY (testing_item_id) REFERENCES testing_item(id)
);
CREATE TABLE testing_item (
  id SERIAL primary key,
  name TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE TABLE equipment (
  id SERIAL primary key,
  name TEXT,
  brand TEXT,
  model TEXT,
  cal_period_id INT,
  calibration_date TIMESTAMP,
  expiry_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (cal_period_id) REFERENCES cal_period(id)
);
CREATE TABLE cal_period (
  id SERIAL primary key,
  parameter TEXT,
  cal_period INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE TABLE equipment_testing_info (
  id SERIAL primary key,
  equipment_id INT,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  testing_info_id INT,
  FOREIGN KEY (testing_info_id) REFERENCES testing_info(id)
);
CREATE TABLE reagent_sample_info (
  id SERIAL primary key,
  batch_id INT,
  FOREIGN KEY (batch_id) REFERENCES sample_info(id),
  reagent_id INT,
  FOREIGN KEY (reagent_id) REFERENCES reagent_list(id)
);
CREATE TABLE reagent_list(
  id SERIAL primary key,
  name TEXT,
  testing_item_id INT,
  FOREIGN KEY (testing_item_id) REFERENCES testing_item(id),
  rm_id INT,
  FOREIGN KEY (rm_id) REFERENCES rm_list(id),
  prepare_date TIMESTAMP,
  expiry_date DATE,
  prepared_by INT,
  FOREIGN KEY (prepared_by) REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
CREATE TABLE rm_list(
  id SERIAL primary key,
  chemical_name TEXT,
  is_crm BOOLEAN,
  expiry_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);