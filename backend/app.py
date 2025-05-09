from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import chess
import chess.engine

app = Flask(__name__)
CORS(app)

#inicia board
board = chess.Board()

@app.route("/")
def home():
    return jsonify({"mensagem":"API do Chess IA"})

@app.route("/estado", methods=["GET"])
def estado():
    return jsonify({
        "fen": board.fen(),
        "tabuleiro": board.board_fen(),
        "turno": "white" if board.turn else "black",
        "checkmate": board.is_checkmate(),
        "stalemate": board.is_stalemate(),
        "legal_moves": [move.uci() for move in board.legal_moves]
    })

@app.route("/mover", methods=["POST"])
def mover():
    data = request.get_json()
    movimento = data.get("movimento")

    try:
        move = chess.Move.from_uci(movimento)
        if move in board.legal_moves:
            board.push(move)
            return jsonify({"sucesso": True, "mensagem": "Movimento realizado com sucesso."})
        else:
            return jsonify({"sucesso": False, "mensagem": "Movimento ilegal."})
    except:
        return jsonify({"sucesso": False, "mensagem": "Erro no formato do movimento."})

if __name__ == "__main__":
    print("Servidor iniciado")
    app.run(debug=True)