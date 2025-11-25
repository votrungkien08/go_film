<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1️⃣ Thêm cột slug nếu chưa có
        if (!Schema::hasColumn('country', 'slug')) {
            Schema::table('country', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('country_name');
            });
        }

        // 2️⃣ Populate slug cho dữ liệu cũ
        DB::table('country')->orderBy('id')->chunk(100, function ($rows) {
            foreach ($rows as $row) {
                $name = $row->country_name ?? '';
                $base = Str::slug($name);
                if (empty($base)) {
                    $base = 'country-' . $row->id;
                }

                $slug = $base;
                $i = 1;
                while (
                    DB::table('country')
                    ->where('slug', $slug)
                    ->where('id', '!=', $row->id)
                    ->exists()
                ) {
                    $slug = $base . '-' . $i;
                    $i++;
                }

                DB::table('country')->where('id', $row->id)->update(['slug' => $slug]);
            }
        });

        // 3️⃣ Đảm bảo không còn slug rỗng
        DB::table('country')->whereNull('slug')->orWhere('slug', '')->orderBy('id')->chunk(100, function ($rows) {
            foreach ($rows as $row) {
                DB::table('country')->where('id', $row->id)->update([
                    'slug' => 'country-' . $row->id
                ]);
            }
        });

        // 4️⃣ Thêm unique index
        $hasIndex = DB::select("SHOW INDEX FROM `country` WHERE Key_name = 'country_slug_unique'");
        if (empty($hasIndex)) {
            Schema::table('country', function (Blueprint $table) {
                $table->unique('slug', 'country_slug_unique');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('country', 'slug')) {
            Schema::table('country', function (Blueprint $table) {
                $table->dropUnique('country_slug_unique');
                $table->dropColumn('slug');
            });
        }
    }
};
