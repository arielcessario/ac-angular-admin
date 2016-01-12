<?php
session_start();
require_once '../MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if ($decoded->function == 'getVentasWeb') {
    getVentasWeb();
} elseif ($decoded->function == 'confirmarVentaWeb') {
    confirmarVentaWeb($decoded->carrito_id);
}


function getVentasWeb()
{
    $db = new MysqliDb();

    $results = $db->rawQuery('select carrito_id, status, total, fecha, usuario_id, 0 cliente, 0 detalle from carritos;');
    $ventas_web = array();
    $clientes = array();

    foreach ($results as $row) {
        $db->where('usuario_id', $row["usuario_id"]);
        $results_clientes = $db->get('usuarios');
        $row["usuario"] = $results_clientes;
        array_push($clientes, $row);
    }

    foreach ($clientes as $row) {
        $results_venta = $db->rawQuery('select
carrito_detalle_id,
carrito_id,
cantidad,
producto_id,
(select nombre from productos where producto_id = cd.producto_id) nombre,
precio_unitario
from carrito_detalles cd
where cd.carrito_id = ' . $row["carrito_id"] . ';');
        $row["detalle"] = $results_venta;
        array_push($ventas_web, $row);
    }

    echo json_encode($ventas_web);
}


function confirmarVentaWeb($carrito_id)
{
    $db = new MysqliDb();
    $data = array('status'=>3);
    $db->where("carrito_id", $carrito_id);
    if($db->update("carritos", $data)){
        echo json_encode('ok');
    }

}