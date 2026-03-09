<?php
class AnnouncementController {
    public function list($params, $user) {
        $list = Announcement::getActive(10);
        jsonResponse(['code' => 0, 'data' => $list]);
    }
}
