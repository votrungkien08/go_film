<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QueryFilter
{
    protected $request;
    protected $filters;
    protected $builder;
    protected $filterable = [];

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->filters  = $request->all();
    }


    public function apply(Builder $builder, array $filterable = [], array $orderFields = [])
    {
        $this->builder =   $builder;
        $this->filterable = $filterable;
        foreach ($this->filters  as $name => $value) {
            if (is_null($value) || $value === '') {
                continue;
            }
            // call method children
            $method = 'filter' . Str::studly($name);
            if (method_exists($this, $method)) {
                $this->{$method}($value);
                continue;
            }

            if (in_array($name, $this->filterable)) {
                $this->builder->where($name, $value);
            }
        }
        return $this->builder;
    }
}
