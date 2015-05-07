<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if ($decoded->function == 'getCategorias') {
    getCategorias();
}elseif($decoded->function == 'save'){
    saveCategoria($decoded->categoria);
}elseif($decoded->function == 'deleteCategoria'){
    deleteCategoria($decoded->id);
}elseif($decoded->function == 'update'){
    updateCategoria($decoded->categoria);
}


function getCategorias(){
    $db = new MysqliDb();

    $results = $db->get('categorias');

    echo json_encode($results);
}

function saveCategoria($categoria){
    $db = new MysqliDb();
    $item_decoded = json_decode($categoria);
//    $fotos_decoded = json_decode($producto->fotos);
    $data = array(
        'nombre' => $item_decoded->nombre
    );


    $results = $db->insert('categorias', $data);


    $res = ['status' => 1, 'results' => 0];
    if ($results > -1) {
        $res["results"] = $results;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }

}

function updateCategoria($categoria){
    $db = new MysqliDb();
    $item_decoded = json_decode($categoria);
//    $fotos_decoded = json_decode($producto->fotos);
    $data = array(
        'nombre' => $item_decoded->nombre
    );

    $db->where('categoria_id', $item_decoded->categoria_id);


    $results = $db->update('categorias', $data);


    $res = ['status' => 1, 'results' => 0];
    if ($results) {

        $res["results"] = 1;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }

}

function deleteCategoria($categoria){
    $db = new MysqliDb();
//    $item_decoded = json_decode($categoria);
//    $fotos_decoded = json_decode($producto->fotos);


    $db->where('categoria_id', $categoria);


    $results = $db->delete('categorias');


    $res = ['status' => 1, 'results' => 0];
    if ($results) {

        $res["results"] = 1;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }

}