<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);
if ($decoded != null) {
    if ($decoded->function == 'saveOferta') {
        foreach(json_decode($decoded->ofertas) as $oferta){
//            $of = $oferta;
            saveOferta($oferta);
        }
    }
} else {

    $function = $_GET["function"];
    if ($function == 'getOfertas') {
        getOfertas();
    }

}


function getOfertas()
{
    $db = new MysqliDb();

//    $results = $db->get('ofertas');
//    $results = $db->rawQuery('Select oferta_id, o.producto_id producto_id, kit_id, precio, o.descripcion descripcion,
//    imagen, titulo, p.nombre producto from ofertas o inner join productos p on o.producto_id = p.producto_id;');

    $results = $db->rawQuery('Select oferta_id, o.producto_id producto_id, kit_id, precio, o.descripcion descripcion,
    imagen, titulo, 0 producto from ofertas o;');

    foreach($results as $key => $row){
        $db->where('producto_id', $row["producto_id"]);
        $producto = $db->get('productos');
        $results[$key]["producto"] = $producto;
    }


    echo json_encode($results);
}

function saveOferta($oferta)
{
    $db = new MysqliDb();
    $item_decoded = $oferta;
//    $fotos_decoded = json_decode($producto->fotos);
    $db->where('oferta_id', $item_decoded->oferta_id);
    $data = array(
        'producto_id' => $item_decoded->producto_id,
        'precio' => $item_decoded->precio,
        'descripcion' => $item_decoded->descripcion,
        'imagen' => $item_decoded->imagen,
        'titulo' => $item_decoded->titulo
    );


    $results = $db->update('ofertas', $data);


    $res = ['status' => 1, 'results' => 0];

    echo json_encode($results);

    if ($results) {
        $res["results"] = $results;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }

}

