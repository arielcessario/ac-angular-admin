<?php


session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if($decoded->function === 'get'){
    get();
}else if($decoded->function === 'getBy'){
    getBy($decoded->params);
}

function get()
{
    $db = new MysqliDb();

    $results = $db->get("countries");


    if ($db->count > 0) {
        echo json_encode($results);
    } else {
        echo 'error';
    }
}

function getBy($params)
{
    $db = new MysqliDb();
    $decoded = json_decode($params);


    $db->where('id ' . $params);
    $results = $db->get("countries");


    if ($db->count > 0) {
        echo json_encode($results);
    } else {
        echo 'error';
    }
}

?>