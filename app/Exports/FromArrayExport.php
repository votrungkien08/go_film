<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;

class FromArrayExport implements FromArray
{
    protected $rows;

    public function __construct(array $rows)
    {
        $this->rows = $rows;
    }

    public function array(): array
    {
        return $this->rows;
    }
}