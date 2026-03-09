<?php
class AuthController {
    public function login($params, $user) {
        $input = getJsonInput();
        $login = $input['username'] ?? $input['email'] ?? '';
        $password = $input['password'] ?? '';
        if (!$login || !$password) {
            jsonResponse(['code' => 400, 'msg' => '请输入账号和密码']);
        }
        $u = User::findByUsernameOrEmail($login);
        if (!$u || !password_verify($password, $u['password_hash'])) {
            jsonResponse(['code' => 401, 'msg' => '账号或密码错误']);
        }
        $token = Jwt::encode(['user_id' => $u['id'], 'username' => $u['username']]);
        jsonResponse([
            'code' => 0,
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $u['id'],
                    'username' => $u['username'],
                    'email' => $u['email'],
                ]
            ]
        ]);
    }

    public function register($params, $user) {
        $input = getJsonInput();
        $username = trim($input['username'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $inviteCode = trim($input['invite_code'] ?? '');
        if (!$username || !$password || !$inviteCode) {
            jsonResponse(['code' => 400, 'msg' => '请填写完整信息']);
        }
        if (!InviteCode::validate($inviteCode)) {
            jsonResponse(['code' => 400, 'msg' => '邀请码无效或已用完']);
        }
        $login = $username;
        if (strpos($username, '@') !== false) {
            $email = $username;
            $username = explode('@', $username)[0];
        }
        if (User::findByUsernameOrEmail($login)) {
            jsonResponse(['code' => 400, 'msg' => '该账号已存在']);
        }
        $id = User::create([
            'username' => $username,
            'email' => $email ?: null,
            'password' => $password,
            'invite_code' => $inviteCode
        ]);
        InviteCode::incrementUsed($inviteCode);
        $u = User::findById($id);
        $token = Jwt::encode(['user_id' => $u['id'], 'username' => $u['username']]);
        jsonResponse([
            'code' => 0,
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $u['id'],
                    'username' => $u['username'],
                    'email' => $u['email'],
                ]
            ]
        ]);
    }

    public function me($params, $user) {
        jsonResponse(['code' => 0, 'data' => $user]);
    }
}
