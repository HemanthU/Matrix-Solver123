# app.py (Flask app for solving n x n linear equations)
from flask import Flask, render_template, request
import os

app = Flask(__name__)

def determinant(matrix):
    if len(matrix) == 2:
        return matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0]
    det = 0
    for c in range(len(matrix)):
        minor = [row[:c] + row[c+1:] for row in matrix[1:]]
        det += ((-1)**c) * matrix[0][c] * determinant(minor)
    return det

def get_matrix_minor(matrix, i, j):
    return [row[:j] + row[j+1:] for row in (matrix[:i]+matrix[i+1:])]

def inverse_matrix(matrix):
    det = determinant(matrix)
    if det == 0:
        return None
    n = len(matrix)
    cofactors = []
    for r in range(n):
        cofactor_row = []
        for c in range(n):
            minor = get_matrix_minor(matrix, r, c)
            cofactor_row.append(((-1)**(r + c)) * determinant(minor))
        cofactors.append(cofactor_row)
    cofactors = list(map(list, zip(*cofactors)))  # transpose
    for r in range(n):
        for c in range(n):
            cofactors[r][c] = cofactors[r][c] / det
    return cofactors

def multiply_matrix(A, B):
    result = []
    for row in A:
        total = sum(row[i] * B[i] for i in range(len(B)))
        result.append(round(total, 4))
    return result

@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    size = 2
    matrix = []
    constants = []
    if request.method == 'POST':
        try:
            size = int(request.form['size'])
            matrix = []
            constants = []
            for i in range(size):
                row = [float(request.form[f"a_{i}_{j}"]) for j in range(size)]
                matrix.append(row)
                constants.append(float(request.form[f"c_{i}"]))

            inv = inverse_matrix(matrix)
            if inv is None:
                result = "Matrix is singular, no unique solution."
            else:
                result = multiply_matrix(inv, constants)
        except Exception as e:
            result = f"Error: {str(e)}"

    return render_template('index.html', result=result, size=size, matrix=matrix, constants=constants)

if __name__ == '__main__':
    app.run(debug=True)
