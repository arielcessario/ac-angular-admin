<?php


session_start();


// Token
$decoded_token = null;

if (file_exists('../includes/MyDBi.php')) {
    require_once '../includes/MyDBi.php';
    require_once '../includes/config.php';
} else {
    require_once 'MyDBi.php';
}

$data = file_get_contents("php://input");

// Decode data from js
$decoded = json_decode($data);


// Si la seguridad está activa
//if ($jwt_enabled) {
//
//    // Carga el jwt_helper
//    if (file_exists('../jwt_helper.php')) {
//        require_once '../jwt_helper.php';
//    } else {
//        require_once 'jwt_helper.php';
//    }
//
//
//    // Las funciones en el if no necesitan usuario logged
//    if (($decoded == null) && (($_GET["function"] != null) &&
//            ($_GET["function"] == 'get'))
//    ) {
//        $token = '';
//    } else {
//        checkSecurity();
//    }
//
//}


if ($decoded != null) {

} else {
    $function = $_GET["function"];
    if ($function == 'getMargenes') {
        getMargenes($_GET["desde"], $_GET["hasta"]);
    }
}


function getMargenes($desde, $hasta)
{
    $db = new MysqliDb();


    $SQL = '
    SELECT
    SUM(m.importe) importe,
    m.cuenta_id,
    sum((SELECT
            d1.valor
        FROM
            detallesmovimientos d1
        WHERE
            d1.detalle_tipo_id = 13
                AND d1.movimiento_id = m.movimiento_id)) cantidad,
    (SELECT
            p.nombre
        FROM
            detallesmovimientos d2
                LEFT JOIN
            productos p ON d2.valor = p.producto_id
        WHERE
            d2.detalle_tipo_id = 8
                AND d2.movimiento_id = m.movimiento_id) producto
FROM
    movimientos m
WHERE
    m.movimiento_id IN (SELECT
            d.movimiento_id
        FROM
            detallesmovimientos d
        WHERE
            d.detalle_tipo_id = 8)
        AND m.fecha BETWEEN "' . $desde . '" AND "' . $hasta . '"
        AND m.cuenta_id in ("4.1.1.01","5.1.1.01")
GROUP BY m.cuenta_id, producto
ORDER BY m.asiento_id, m.movimiento_id;
    ';


    $results = $db->rawQuery($SQL);

    echo json_encode($results);
}


