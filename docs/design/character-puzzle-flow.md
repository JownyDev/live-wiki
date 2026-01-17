flowchart TD
    Start([Inicio: atrio]) --> Gate[Puerta sellada]

    Gate --> MiraTalk{Hablar con Mira}
    Gate --> BranTalk{Hablar con Bran}
    Gate --> KellenTalk{Hablar con Kellen}
    Gate --> SoloAct{Actuar solo}

    MiraTalk --> MiraKey[Recuperar llave de repuesto]
    MiraKey --> KeyMira[Llave robada]

    BranTalk --> BranTrial[Prueba fisica]
    BranTrial --> KeyBran[Llave de servicio]

    KellenTalk --> Accept[Asumir responsabilidad]
    Accept --> KeyKellen[Llave entregada]

    SoloAct --> Steal[Robar o matar por la llave]
    SoloAct --> Force[Forzar cerrojo]

    KeyMira --> Open[Puerta abierta]
    KeyBran --> Open
    KeyKellen --> Open
    Steal --> Open
    Force --> Open

    Open --> Veyr[Juicio de Veyr]
    Open --> Weight[La via elegida pesa en el juicio]
    Weight --> Veyr

    Veyr --> Eval{Acciones + intencion}
    Eval -->|Honestidad + misericordia| Heaven[Cielo]
    Eval -->|Crueldad o engano| Hell[Infierno]
