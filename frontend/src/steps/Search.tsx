import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";

import { Data } from "../types";
import { searchData } from "../services/search";

const DEBOUNCE_TIME = 300

export const Search = ( {initialData} : { initialData: Data }) => {
    const [data, setData] = useState<Data>(initialData)
    const [search, setSearch] = useState<string>(() => {
        const searchParams = new URLSearchParams(window.location.search)
        return searchParams.get('q') ?? ''
    })

    const debounceSearch = useDebounce(search, DEBOUNCE_TIME) 

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value)
    }

    useEffect(() => {
        const newPathname = debounceSearch === ''
        ? window.location.pathname:
        `?q=${debounceSearch}`
        window.history.pushState({}, '',newPathname)
    }, [debounceSearch])

    useEffect(() => {
        if(!debounceSearch) {
            setData(initialData)
            return
        }

        // llamar a la api para filtrar los resultados
        searchData(debounceSearch)
        .then(res => {
            const [err, newData] = res
            if(err) {
                toast.error(err.message)
                return
            }

            if(newData) setData(newData)
        })
    }, [debounceSearch, initialData])

    return (
        <div>
            <Toaster />
            <h1>Search</h1>
            <form>
                <input 
                onChange={handleSearch}
                type="search"
                placeholder="Buscar informacion..." />
            </form>
            <ul>
                {
                data.map((row) => (
                    <li key={row.id}>
                        <article>
                                {
                                    Object
                                    .entries(row)
                                    .map(([key, value]) => <p key={key}><strong>{key}:</strong>{value}</p>)
                                }
                            </article>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}