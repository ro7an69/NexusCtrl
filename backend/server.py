from flask import Flask, render_template, jsonify

app = Flask(__name)

# Serve your ReactJS frontend (assuming you've built it)


@app.route('/')
def index():
    return render_template('index.html')

# An endpoint to send data to the frontend


@app.route('/send_data')
def send_data():
    data = "Hello from the server!"
    return jsonify(data=data)


if __name__ == '__main__':
    app.run(debug=True)
