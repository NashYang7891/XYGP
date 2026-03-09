<?php
namespace Admin;

class AnnouncementController {
    public function list($params, $admin) {
        $pdo = \Database::get();
        $stmt = $pdo->query("SELECT * FROM announcements ORDER BY sort_order DESC, id DESC");
        $list = $stmt->fetchAll();
        jsonResponse(['code' => 0, 'data' => $list]);
    }

    public function create($params, $admin) {
        $input = getJsonInput();
        $title = trim($input['title'] ?? '');
        $content = $input['content'] ?? '';
        if (!$title) {
            jsonResponse(['code' => 400, 'msg' => '请填写标题']);
        }
        $pdo = \Database::get();
        $stmt = $pdo->prepare("INSERT INTO announcements (title, content, is_active, sort_order) VALUES (?, ?, 1, 0)");
        $stmt->execute([$title, $content]);
        jsonResponse(['code' => 0, 'data' => ['id' => $pdo->lastInsertId()], 'msg' => '添加成功']);
    }

    public function update($params, $admin) {
        $id = (int)($params[0] ?? 0);
        $input = getJsonInput();
        $pdo = \Database::get();
        $fields = [];
        $vals = [];
        if (isset($input['title'])) { $fields[] = 'title=?'; $vals[] = $input['title']; }
        if (isset($input['content'])) { $fields[] = 'content=?'; $vals[] = $input['content']; }
        if (isset($input['is_active'])) { $fields[] = 'is_active=?'; $vals[] = $input['is_active']; }
        if (empty($fields)) {
            jsonResponse(['code' => 400, 'msg' => '无更新字段']);
        }
        $vals[] = $id;
        $stmt = $pdo->prepare("UPDATE announcements SET " . implode(', ', $fields) . " WHERE id=?");
        $stmt->execute($vals);
        jsonResponse(['code' => 0, 'msg' => '更新成功']);
    }

    public function delete($params, $admin) {
        $id = (int)($params[0] ?? 0);
        $pdo = \Database::get();
        $stmt = $pdo->prepare("DELETE FROM announcements WHERE id=?");
        $stmt->execute([$id]);
        jsonResponse(['code' => 0, 'msg' => '删除成功']);
    }
}
