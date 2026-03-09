# -*- coding: utf-8 -*-
"""iTick API K线数据服务 - Flask API (替代 yfinance)"""
import os
from pathlib import Path
import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env')
from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

# iTick API 配置 - 股票 REST API: https://api.itick.org/stock
ITICK_TOKEN = os.environ.get('ITICK_TOKEN', '')
ITICK_BASE = 'https://api.itick.org'
# 仅日本股票，固定 region=JP
REGION = 'JP'

# period -> (kType, limit)  kType: 8=日K 9=周K 10=月K
PERIOD_MAP = {
    '5d': (8, 5),
    '1mo': (8, 22),
    '3mo': (8, 66),
    '6mo': (8, 132),
    '1y': (8, 252),
    '2y': (8, 504),
    '5y': (8, 1260),
}


def fetch_itick_kline(region, code, k_type, limit, et=None):
    """调用 iTick K线接口"""
    url = f'{ITICK_BASE}/stock/kline'
    params = {
        'region': region,
        'code': code,
        'kType': k_type,
        'limit': limit,
    }
    if et:
        params['et'] = et
    headers = {
        'accept': 'application/json',
        'token': ITICK_TOKEN,
    }
    resp = requests.get(url, params=params, headers=headers, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    if data.get('code') != 0:
        raise Exception(data.get('msg', 'iTick API 错误'))
    return data.get('data', [])


@app.route('/kline', methods=['GET'])
def kline():
    symbol = request.args.get('symbol', '').strip().upper()
    period = request.args.get('period', '1mo')
    if not symbol:
        return jsonify({'code': 400, 'msg': '缺少 symbol'}), 400
    if not ITICK_TOKEN:
        return jsonify({'code': 500, 'msg': '未配置 ITICK_TOKEN，请在环境变量中设置'}), 500

    k_type, limit = PERIOD_MAP.get(period, (8, 22))
    # 日股代码：纯数字，如 7203、9984
    code = symbol.replace('.T', '').replace('.', '')
    try:
        raw = fetch_itick_kline(REGION, code, k_type, limit)
        result = []
        for item in raw:
            t_ms = item.get('t')
            if t_ms:
                dt = datetime.utcfromtimestamp(t_ms / 1000)
                date_str = dt.strftime('%Y-%m-%d')
            else:
                date_str = ''
            result.append({
                'date': date_str,
                'open': round(float(item['o']), 2) if item.get('o') is not None else None,
                'high': round(float(item['h']), 2) if item.get('h') is not None else None,
                'low': round(float(item['l']), 2) if item.get('l') is not None else None,
                'close': round(float(item['c']), 2) if item.get('c') is not None else None,
                'volume': int(item['v']) if item.get('v') is not None else None,
            })
        return jsonify({'code': 0, 'data': result})
    except requests.RequestException as e:
        return jsonify({'code': 500, 'msg': f'请求失败: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'code': 500, 'msg': str(e)}), 500


@app.route('/quote', methods=['GET'])
def quote():
    """获取最新价（用 K线最后一条作为近似）"""
    symbol = request.args.get('symbol', '').strip().upper()
    if not symbol:
        return jsonify({'code': 400, 'msg': '缺少 symbol'}), 400
    if not ITICK_TOKEN:
        return jsonify({'code': 500, 'msg': '未配置 ITICK_TOKEN'}), 500
    try:
        code = symbol.replace('.T', '').replace('.', '')
        raw = fetch_itick_kline(REGION, code, 8, 1)
        if not raw:
            return jsonify({'code': 0, 'data': None})
        last = raw[-1]
        return jsonify({
            'code': 0,
            'data': {
                'symbol': symbol,
                'shortName': symbol,
                'regularMarketPrice': last.get('c'),
                'regularMarketVolume': last.get('v'),
            }
        })
    except Exception as e:
        return jsonify({'code': 500, 'msg': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'code': 0, 'msg': 'ok'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
