<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if ($decoded->function == 'getClientes') {
    getClientes();
}elseif($decoded->function == 'save'){
    saveCliente($decoded->cliente);
}elseif($decoded->function == 'deleteCliente'){
    deleteCliente($decoded->id);
}elseif($decoded->function == 'update'){
    updateCliente($decoded->cliente);
}


function getClientes(){
    $db = new MysqliDb();

    $results = $db->get('clientes');

    echo json_encode($results);
}

function saveCliente($cliente){
    $db = new MysqliDb();
    $item_decoded = json_decode($cliente);
//    $fotos_decoded = json_decode($producto->fotos);
    $data = array(
        'nombre' => $item_decoded->nombre
    );


    $results = $db->insert('clientes', $data);


    $res = ['status' => 1, 'results' => 0];
    if ($results > -1) {
        $res["results"] = $results;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }

}

function updateCliente($cliente){
    $db = new MysqliDb();
    $item_decoded = json_decode($cliente);
//    $fotos_decoded = json_decode($producto->fotos);
    $data = array(
        'nombre' => $item_decoded->nombre
    );

    $db->where('cliente_id', $item_decoded->cliente_id);


    $results = $db->update('clientes', $data);


    $res = ['status' => 1, 'results' => 0];
    if ($results) {

        $res["results"] = 1;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }

}

function deleteCliente($cliente){
    $db = new MysqliDb();
//    $item_decoded = json_decode($cliente);
//    $fotos_decoded = json_decode($producto->fotos);


    $db->where('cliente_id', $cliente);


    $results = $db->delete('clientes');


    $res = ['status' => 1, 'results' => 0];
    if ($results) {

        $res["results"] = 1;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }

}