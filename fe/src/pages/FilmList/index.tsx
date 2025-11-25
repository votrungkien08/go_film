import { Link, useLocation } from 'react-router-dom';
import { useFilmUpdate,useFilmRank,useFilterAdvanceFilm} from '@/hooks/useFilm';
const requestParam = (location) => {
    const params = new URLSearchParams(location.search);
    const isRank = params.get('rank') === 'true';
    const isUpdate = params.get('update') === 'true';

    const query: Record<string, string> = {};
    const getParam = [
        'genre',
        'country',
        'year',
        'search'
    ]
    if (isRank) {
        query.rank = 'true'
    }
    if (isUpdate) {
        query.update = 'true'
    }
    if (params.get('type') ==='phim-bo') {
        query.type = '1';
    }
    if (params.get('type') ==='phim-le') {
        query.type = '0';
    }

    getParam.forEach((item) => {
        const value = params.get(item)
        if (value) {
            query[item] = value;
        }

    })

    return query
}

const FilmList = () => {
    const location = useLocation();
    const queryParam = requestParam(location);
    console.log('queryParam',queryParam)
    const { filterAdvanceFilm } = useFilterAdvanceFilm(queryParam);
    const advanceFilm = filterAdvanceFilm;
    const films = advanceFilm ?? [];
    console.log('films', films);
    console.log("DEBUG >>> queryParam:", queryParam);
    console.log("DEBUG >>> advanceFilm:", advanceFilm);
    console.log("DEBUG >>> films (final):", films);
    
    return (
        <div className="min-h-screen -mx-4 bg-gradient-to-br from-gray-900 via-[#6f757a] to-gray-800 border-l border-gray-700/50">
            <div
 
                className="mx-4 pt-24">
                
                {/* Enhanced Header */}
                <div className="text-center mb-12">
                    <h2 
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-4">
                        {queryParam.rank === 'true'
                                ? 'Phim Xếp Hạng'
                                : queryParam.update === 'true'
                                    ? 'Phim Mới Cập Nhật'
                                    : 'Danh Sách Phim'}
                    </h2>
                    <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
                </div>


                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {Array.isArray(advanceFilm) && advanceFilm.map((item) => (
                            <div
                                key={item.id}
                                className="relative p-4 bg-neutral-800 rounded-xl shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative w-full h-64 group">
                                    {item.thumb && (
                                        <img
                                            src={item.thumb}
                                            alt={item.title_film}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    )}

                                    {/* Hover overlay - excluding the delete button area */}
                                    <Link
                                        to={`/film/${item.slug}`}
                                        className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center rounded-lg"
                                        style={{ zIndex: 1 }}
                                    >
                                        <h3 className="text-lg font-semibold text-white text-center px-2">
                                            {item.title_film || 'Tên phim không xác định'}
                                        </h3>
                                    </Link>
                                </div>
                            </div>
                        ))}

                    </div>
                        

                
            </div>
        </div>
    );
};

export default FilmList;