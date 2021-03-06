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
    } elseif ($function == 'getTotalesPorCuenta') {
        getTotalesPorCuenta($_GET["desde"], $_GET["hasta"]);
    } elseif ($function == 'cierreDeCaja') {
        cierreDeCaja($_GET["sucursal_id"], $_GET["pos_id"]);
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


function getTotalesPorCuenta($desde, $hasta)
{
    $db = new MysqliDb();


    $SQL = '(select
c.descripcion,
sum(m.importe) importe,
m.cuenta_id
from movimientos m left join cuentas c on c.cuenta_id = m.cuenta_id
where
m.fecha BETWEEN "' . $desde . '" AND "' . $hasta . '"
and importe <0
group by c.descripcion, m.cuenta_id)
union
(select
c.descripcion,
sum(m.importe) importe,
m.cuenta_id
from movimientos m left join cuentas c on c.cuenta_id = m.cuenta_id
where
m.fecha BETWEEN "' . $desde . '" AND "' . $hasta . '"
and importe > 0
group by c.descripcion, m.cuenta_id)';


    $results = $db->rawQuery($SQL, '', false);

    echo json_encode($results);
}


function cierreDeCaja($sucursal_id, $pos_id)
{
    $db = new MysqliDb();


//    $SQL01 = 'select
//c.descripcion,
//sum(m.importe) importe,
//m.cuenta_id
//from movimientos m left join cuentas c on c.cuenta_id = m.cuenta_id
//where
//m.asiento_id > (select asiento_inicio_id from cajas where pos_id = ' . $pos_id . ' and sucursal_id = ' . $sucursal_id . ' order by caja_id desc limit 1)
//and sucursal_id = ' . $sucursal_id . ' and pos_id=' . $pos_id . '
//group by c.descripcion, m.cuenta_id;';


    $SQL01 = '(SELECT
    c.descripcion, SUM(m.importe) importe, m.cuenta_id
FROM
    movimientos m
        LEFT JOIN
    cuentas c ON c.cuenta_id = m.cuenta_id
WHERE
    m.asiento_id > (SELECT
            asiento_inicio_id
        FROM
            cajas
        WHERE
            pos_id = ' . $pos_id . ' AND sucursal_id = ' . $sucursal_id . '
        ORDER BY caja_id DESC
        LIMIT 1)
        AND sucursal_id = ' . $sucursal_id . '
        AND pos_id = ' . $pos_id . '
        AND (c.cuenta_id LIKE "4.%")
GROUP BY c.descripcion , m.cuenta_id)

UNION

(SELECT
"Ahorro" descripcion,
    total + (SELECT
            SUM(m.importe)
        FROM
            movimientos m
        WHERE
            m.fecha >= date_add(last_day(date_sub(now(),interval 30 day)), interval 1 day)
                AND sucursal_id = ' . $sucursal_id . '
                AND m.cuenta_id = "1.1.1.3' . $sucursal_id . '"
        GROUP BY m.cuenta_id) importe,
        "1.1.1.3' . $sucursal_id . '" cuenta_id
FROM
    resultados
WHERE
    cuenta_id = "1.1.1.3' . $sucursal_id . '" AND mes = Month(last_day(date_sub(now(),interval 30 day)))
        AND anio = Year(last_day(date_sub(now(),interval 30 day)))
        )
UNION

(SELECT
    "Caja Chica" Caja, (SUM(m.importe) + (SELECT
            saldo_inicial
        FROM
            cajas
        WHERE
            pos_id = ' . $pos_id . ' AND sucursal_id = ' . $sucursal_id . '
        ORDER BY caja_id DESC
        LIMIT 1))  importe, "1.1.1.0' . $sucursal_id . '" cuenta_id
FROM
    movimientos m
WHERE
    m.asiento_id > (SELECT
            asiento_inicio_id
        FROM
            cajas
        WHERE
            pos_id = ' . $pos_id . ' AND sucursal_id = ' . $sucursal_id . '
        ORDER BY caja_id DESC
        LIMIT 1)
        AND sucursal_id = ' . $sucursal_id . '
        AND pos_id = ' . $pos_id . '
        AND m.cuenta_id = "1.1.1.0' . $sucursal_id . '")';


    $SQL02 = 'select * from cajas c inner join cajas_detalles d on c.caja_id = d.caja_id where c.pos_id = ' . $pos_id . ' and c.sucursal_id = ' . $sucursal_id . ' order by c.caja_id desc limit 1;';

    $SQL03 = 'SELECT
    sum((select valor from detallesmovimientos where movimiento_id = m.movimiento_id and detalle_tipo_id = 13)) cantidad,
    m.detalle_tipo_id,
    valor,
    nombre
FROM
    detallesmovimientos m
        LEFT JOIN
    productos ON valor = producto_id
WHERE
    movimiento_id IN (SELECT
            movimiento_id
        FROM
            movimientos
        WHERE
            cuenta_id like "4.1.1.01" and
            asiento_id >= (SELECT
                    asiento_inicio_id
                FROM
                    cajas
                WHERE
                    sucursal_id = ' . $sucursal_id . ' and pos_id=' . $pos_id . '
                ORDER BY caja_id DESC
                LIMIT 1))
        AND detalle_tipo_id = 8
group by
detalle_tipo_id, valor, nombre;';

    $SQL04 = 'SELECT
    concat(c.descripcion, \': \', d.valor) descripcion , m.importe importe, m.cuenta_id
FROM
    movimientos m
        INNER JOIN
    detallesmovimientos d ON m.movimiento_id = d.movimiento_id
    INNER JOIN
    cuentas c
    ON m.cuenta_id = c.cuenta_id
WHERE
m.sucursal_id = ' . $sucursal_id . ' and m.pos_id=' . $pos_id . ' and
    (m.cuenta_id LIKE "5.2.%" || m.cuenta_id LIKE "5.3.%")
        AND d.detalle_tipo_id = 2
        AND m.asiento_id >= (SELECT
                    asiento_inicio_id
                FROM
                    cajas
                WHERE
                    sucursal_id = ' . $sucursal_id . ' and pos_id=' . $pos_id . '
                ORDER BY caja_id DESC
                LIMIT 1);';

    $results01 = $db->rawQuery($SQL01, '', false);
    $results02 = $db->rawQuery($SQL02, '', false);
    $results03 = $db->rawQuery($SQL03, '', false);
    $results04 = $db->rawQuery($SQL04, '', false);

    $results = array();

    array_push($results, $results01);
    array_push($results, $results02);
    array_push($results, $results03);
    array_push($results, $results04);

    echo json_encode($results);
}


