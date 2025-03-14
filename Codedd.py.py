from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

# MySQL connection details
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="9384365126",
    database="finalproj"
)

# Define a function to handle MySQL exceptions
def handle_mysql_error(e):
    return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        role = data.get('role')
        name = data.get('name')
        email = data.get('email')
        phone_number = data.get('phone_number')
        address = data.get('address')

        if not role or not name or not email:
            return jsonify({'error': 'Missing required fields'}), 400

        sql = "INSERT INTO Users (role, name, email, phone_number, address) VALUES (%s, %s, %s, %s, %s)"
        val = (role, name, email, phone_number, address)
        mycursor = mydb.cursor()  # Create a cursor within the function
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'User created successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:  # Close the cursor only if it was created
            mycursor.close()

@app.route('/api/students', methods=['POST'])
def create_student():
    try:
        data = request.get_json()
        rfid_card_id = data.get('rfid_card_id')
        name = data.get('name')
        class_name = data.get('class')
        section = data.get('section')
        parent_id = data.get('parent_id')
        fingerprint_id = data.get('fingerprint_id')
        face_recognition_id = data.get('face_recognition_id')

        if not rfid_card_id or not name:
            return jsonify({'error': 'Missing required fields'}), 400

        sql = "INSERT INTO Students (rfid_card_id, name, class, section, parent_id, fingerprint_id, face_recognition_id) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        val = (rfid_card_id, name, class_name, section, parent_id, fingerprint_id, face_recognition_id)
        mycursor = mydb.cursor()
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'Student created successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/parents', methods=['POST'])
def create_parent():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        phone_number = data.get('phone_number')
        wallet_balance = data.get('wallet_balance', 0.0)  # Default to 0.0 if not provided
        spending_limit = data.get('spending_limit', 0.0)  # Default to 0.0 if not provided

        if not name or not email:
            return jsonify({'error': 'Missing required fields'}), 400

        sql = "INSERT INTO Parents (name, email, phone_number, wallet_balance, spending_limit) VALUES (%s, %s, %s, %s, %s)"
        val = (name, email, phone_number, wallet_balance, spending_limit)
        mycursor = mydb.cursor()
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'Parent created successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/parents/<int:parent_id>/wallet', methods=['GET'])
def get_wallet_balance(parent_id):
    try:
        sql = "SELECT wallet_balance FROM Parents WHERE parent_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (parent_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Parent not found'}), 404

        return jsonify({'wallet_balance': result[0]})

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/wallet/deduct', methods=['POST'])
def deduct_from_wallet():
    try:
        data = request.get_json()
        parent_id = data.get('parent_id')
        amount = data.get('amount')

        if not parent_id or not amount:
            return jsonify({'error': 'Missing required fields'}), 400

        # Get current wallet balance
        get_balance_sql = "SELECT wallet_balance FROM Parents WHERE parent_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(get_balance_sql, (parent_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Parent not found'}), 404

        current_balance = result[0]

        if current_balance < amount:
            return jsonify({'error': 'Insufficient funds'}), 400

        new_balance = current_balance - amount

        # Update wallet balance
        update_balance_sql = "UPDATE Parents SET wallet_balance = %s WHERE parent_id = %s"
        mycursor.execute(update_balance_sql, (new_balance, parent_id))
        mydb.commit()

        return jsonify({'message': 'Amount deducted successfully', 'new_balance': new_balance}), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/wallet/topup', methods=['POST'])
def top_up_wallet():
    try:
        data = request.get_json()
        parent_id = data.get('parent_id')
        amount = data.get('amount')

        if not parent_id or not amount:
            return jsonify({'error': 'Missing required fields'}), 400

        # Get current wallet balance
        get_balance_sql = "SELECT wallet_balance FROM Parents WHERE parent_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(get_balance_sql, (parent_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Parent not found'}), 404

        current_balance = result[0]
        new_balance = current_balance + amount

        # Update wallet balance
        update_balance_sql = "UPDATE Parents SET wallet_balance = %s WHERE parent_id = %s"
        mycursor.execute(update_balance_sql, (new_balance, parent_id))
        mydb.commit()

        return jsonify({'message': 'Wallet topped up successfully', 'new_balance': new_balance}), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()
@app.route('/api/canteens', methods=['POST'])
def create_canteen():
    try:
        data = request.get_json()
        name = data.get('name')
        owner_id = data.get('owner_id')
        location = data.get('location')

        if not name or not owner_id:
            return jsonify({'error': 'Missing required fields'}), 400

        sql = "INSERT INTO Canteens (name, owner_id, location) VALUES (%s, %s, %s)"
        val = (name, owner_id, location)
        mycursor = mydb.cursor()
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'Canteen created successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        canteen_id = data.get('canteen_id')
        amount = data.get('amount')
        transaction_type = data.get('transaction_type')  # 'debit' or 'credit'

        if not student_id or not canteen_id or not amount or not transaction_type:
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate transaction_type
        if transaction_type not in ('debit', 'credit'):
            return jsonify({'error': 'Invalid transaction type'}), 400

        sql = "INSERT INTO WalletTransactions (student_id, canteen_id, amount, transaction_type) VALUES (%s, %s, %s, %s)"
        val = (student_id, canteen_id, amount, transaction_type)
        mycursor = mydb.cursor()
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'Transaction created successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()
@app.route('/api/attendance', methods=['POST'])
def record_class_attendance():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        is_present = data.get('is_present')  # True or False

        if not student_id or is_present is None:
            return jsonify({'error': 'Missing required fields'}), 400

        current_time = datetime.now()

        sql = "INSERT INTO AttendanceRecords (student_id, class_date, is_present) VALUES (%s, %s, %s)"
        val = (student_id, current_time.date(), is_present)
        mycursor = mydb.cursor()
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'Attendance recorded successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/marks', methods=['POST'])
def record_student_marks():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        subject = data.get('subject')
        marks_obtained = data.get('marks_obtained')
        total_marks = data.get('total_marks')

        if not student_id or not subject or not marks_obtained or not total_marks:
            return jsonify({'error': 'Missing required fields'}), 400

        current_time = datetime.now()

        sql = "INSERT INTO Marks (student_id, subject, marks_obtained, total_marks, exam_date) VALUES (%s, %s, %s, %s, %s)"
        val = (student_id, subject, marks_obtained, total_marks, current_time.date())
        mycursor = mydb.cursor()
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'Marks recorded successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()
@app.route('/api/face_recognition_logs', methods=['POST'])
def record_face_recognition_log():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        location = data.get('location')

        if not student_id:
            return jsonify({'error': 'Missing required fields'}), 400

        current_time = datetime.now()

        sql = "INSERT INTO FaceRecognitionLogs (student_id, timestamp, location) VALUES (%s, %s, %s)"
        val = (student_id, current_time, location)
        mycursor = mydb.cursor()
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'Face recognition log recorded successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/rfid_logs', methods=['POST'])
def record_rfid_log():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        location = data.get('location')

        if not student_id:
            return jsonify({'error': 'Missing required fields'}), 400

        current_time = datetime.now()

        sql = "INSERT INTO RFIDLogs (student_id, timestamp, location) VALUES (%s, %s, %s)"
        val = (student_id, current_time, location)
        mycursor = mydb.cursor()
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'RFID log recorded successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/devices', methods=['POST'])
def create_device():
    try:
        data = request.get_json()
        device_type = data.get('type')
        location = data.get('location')

        if not device_type:
            return jsonify({'error': 'Missing required fields'}), 400

        sql = "INSERT INTO Devices (type, location) VALUES (%s, %s)"
        val = (device_type, location)
        mycursor = mydb.cursor()
        mycursor.execute(sql, val)
        mydb.commit()

        return jsonify({'message': 'Device created successfully'}), 201

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        sql = "SELECT * FROM Users WHERE user_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (user_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'User not found'}), 404

        user_data = {
            'user_id': result[0],
            'role': result[1],
            'name': result[2],
            'email': result[3],
            'phone_number': result[4],
            'address': result[5]
        }

        return jsonify(user_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    try:
        sql = "SELECT * FROM Students WHERE student_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (student_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Student not found'}), 404

        student_data = {
            'student_id': result[0],
            'rfid_card_id': result[1],
            'name': result[2],
            'class': result[3],
            'section': result[4],
            'parent_id': result[5],
            'fingerprint_id': result[6],
            'face_recognition_id': result[7]
        }

        return jsonify(student_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# Parent Endpoints
@app.route('/api/parents/<int:parent_id>', methods=['GET'])
def get_parent(parent_id):
    try:
        sql = "SELECT * FROM Parents WHERE parent_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (parent_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Parent not found'}), 404

        parent_data = {
            'parent_id': result[0],
            'name': result[1],
            'email': result[2],
            'phone_number': result[3],
            'wallet_balance': result[4],
            'spending_limit': result[5]
        }

        return jsonify(parent_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

@app.route('/api/parents/<int:parent_id>/wallet', methods=['GET'])
def get_parent_wallet_balance(parent_id):
    try:
        sql = "SELECT wallet_balance FROM Parents WHERE parent_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (parent_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Parent not found'}), 404

        return jsonify({'wallet_balance': result[0]})

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# Canteen Endpoints
@app.route('/api/canteens/<int:canteen_id>', methods=['GET'])
def get_canteen(canteen_id):
    try:
        sql = "SELECT * FROM Canteens WHERE canteen_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (canteen_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Canteen not found'}), 404

        canteen_data = {
            'canteen_id': result[0],
            'name': result[1],
            'owner_id': result[2],
            'location': result[3],
            'balance': result[4]
        }

        return jsonify(canteen_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# Transaction Endpoints
@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    try:
        sql = "SELECT * FROM WalletTransactions WHERE transaction_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (transaction_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Transaction not found'}), 404

        transaction_data = {
            'transaction_id': result[0],
            'student_id': result[1],
            'canteen_id': result[2],
            'amount': result[3],
            'transaction_type': result[4],
            'timestamp': str(result[5]) 
        }

        return jsonify(transaction_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# Attendance Endpoints
@app.route('/api/attendance/students/<int:student_id>', methods=['GET'])
def get_student_attendance(student_id):
    try:
        sql = "SELECT * FROM AttendanceRecords WHERE student_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (student_id,))
        results = mycursor.fetchall()

        attendance_data = []
        for row in results:
            attendance_data.append({
                'attendance_id': row[0],
                'student_id': row[1],
                'class_date': str(row[2]),  # Convert date to string
                'is_present': row[3]
            })

        return jsonify(attendance_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# Marks Endpoints
@app.route('/api/marks/students/<int:student_id>', methods=['GET'])
def get_student_marks(student_id):
    try:
        sql = "SELECT * FROM Marks WHERE student_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (student_id,))
        results = mycursor.fetchall()

        marks_data = []
        for row in results:
            marks_data.append({
                'marks_id': row[0],
                'student_id': row[1],
                'subject': row[2],
                'marks_obtained': row[3],
                'total_marks': row[4],
                'exam_date': str(row[5])  # Convert date to string
            })

        return jsonify(marks_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# Bus Routes Endpoints
@app.route('/api/bus_routes/<int:bus_id>', methods=['GET'])
def get_bus_route(bus_id):
    try:
        sql = "SELECT * FROM BusRoutes WHERE route_id = %s" 
        mycursor = mydb.cursor()
        mycursor.execute(sql, (bus_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Bus route not found'}), 404

        bus_route_data = {
            'route_id': result[0],
            'bus_number': result[1],
            'driver_name': result[2],
            'gps_device_id': result[3]
        }

        return jsonify(bus_route_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# Bus Attendance Endpoints
@app.route('/api/bus_attendance/students/<int:student_id>', methods=['GET'])
def get_student_bus_attendance(student_id):
    try:
        sql = "SELECT * FROM BusAttendance WHERE student_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (student_id,))
        results = mycursor.fetchall()

        attendance_data = []
        for row in results:
            attendance_data.append({
                'attendance_id': row[0],
                'student_id': row[1],
                'bus_id': row[2],
                'timestamp': str(row[3])
            })

        return jsonify(attendance_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# Face Recognition Logs Endpoints
@app.route('/api/face_recognition_logs/students/<int:student_id>', methods=['GET'])
def get_student_face_recognition_logs(student_id):
    try:
        sql = "SELECT * FROM FaceRecognitionLogs WHERE student_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (student_id,))
        results = mycursor.fetchall()

        log_data = []
        for row in results:
            log_data.append({
                'log_id': row[0],
                'student_id': row[1],
                'timestamp': str(row[2]),
                'location': row[3]
            })

        return jsonify(log_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# RFID Logs Endpoints
@app.route('/api/rfid_logs/students/<int:student_id>', methods=['GET'])
def get_student_rfid_logs(student_id):
    try:
        sql = "SELECT * FROM RFIDLogs WHERE student_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (student_id,))
        results = mycursor.fetchall()

        log_data = []
        for row in results:
            log_data.append({
                'log_id': row[0],
                'student_id': row[1],
                'timestamp': str(row[2]),
                'location': row[3]
            })

        return jsonify(log_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()

# Device Endpoints
@app.route('/api/devices/<int:device_id>', methods=['GET'])
def get_device(device_id):
    try:
        sql = "SELECT * FROM Devices WHERE device_id = %s"
        mycursor = mydb.cursor()
        mycursor.execute(sql, (device_id,))
        result = mycursor.fetchone()

        if not result:
            return jsonify({'error': 'Device not found'}), 404

        device_data = {
            'device_id': result[0],
            'type': result[1],
            'location': result[2],
            'status': result[3]
        }

        return jsonify(device_data), 200

    except mysql.connector.Error as e:
        return handle_mysql_error(e)

    finally:
        if mycursor:
            mycursor.close()
            
if __name__ == '__main__':
    app.run(debug=True)