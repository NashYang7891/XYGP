<?php
class Jwt {
    public static function encode($payload, $secret = null) {
        $secret = $secret ?? config('app.jwt_secret');
        $header = ['typ' => 'JWT', 'alg' => 'HS256'];
        $payload['exp'] = time() + 86400 * 7; // 7天
        $payload['iat'] = time();
        $b64Header = self::base64UrlEncode(json_encode($header));
        $b64Payload = self::base64UrlEncode(json_encode($payload));
        $signature = hash_hmac('sha256', "$b64Header.$b64Payload", $secret, true);
        $b64Sig = self::base64UrlEncode($signature);
        return "$b64Header.$b64Payload.$b64Sig";
    }

    public static function decode($token, $secret = null) {
        $secret = $secret ?? config('app.jwt_secret');
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        $signature = hash_hmac('sha256', "{$parts[0]}.{$parts[1]}", $secret, true);
        if (self::base64UrlEncode($signature) !== $parts[2]) return null;
        $payload = json_decode(self::base64UrlDecode($parts[1]), true);
        if (isset($payload['exp']) && $payload['exp'] < time()) return null;
        return $payload;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
