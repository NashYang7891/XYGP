<?php
namespace Admin;

class AuthController {
    public function login($params, $admin) {
        $input = getJsonInput();
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        $securityCode = $input['security_code'] ?? '';
        if (!$username || !$password || !$securityCode) {
            jsonResponse(['code' => 400, 'msg' => '请填写完整信息']);
        }
        $a = \AdminUser::findByUsername($username);
        if (!$a || !password_verify($password, $a['password_hash']) || !password_verify($securityCode, $a['security_code_hash'])) {
            jsonResponse(['code' => 401, 'msg' => '账号、密码或安全码错误']);
        }
        $token = \Jwt::encode(['admin_id' => $a['id'], 'username' => $a['username']]);
        jsonResponse([
            'code' => 0,
            'data' => [
                'token' => $token,
                'admin' => ['id' => $a['id'], 'username' => $a['username']]
            ]
        ]);
    }

    public function me($params, $admin) {
        jsonResponse(['code' => 0, 'data' => ['id' => $admin['id'], 'username' => $admin['username']]]);
    }
}
