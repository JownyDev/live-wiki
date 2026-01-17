flowchart LR
    Start([Atrio]) --> Gate[Puerta sellada]

    subgraph Llave
        Kellen[Kellen] --> LK[Llave entregada]
        Mira[Mira] --> LM[Llave de repuesto]
        Bran[Bran] --> LB[Llave de servicio]
        Solo[Jugador] --> LS[Robar o matar por la llave]
    end

    subgraph Fuerza
        Force[Forzar cerrojo] --> Open
    end

    Gate --> Kellen
    Gate --> Mira
    Gate --> Bran
    Gate --> Solo

    LK --> Open[Puerta abierta]
    LM --> Open
    LB --> Open
    LS --> Open

    Open --> Peso[La via elegida pesa en el juicio]
    Peso --> Veyr[Juicio de Veyr]
    Veyr --> Final{Acciones + intencion}
    Final -->|Honestidad + misericordia| Cielo[Cielo]
    Final -->|Crueldad o engano| Infierno[Infierno]
